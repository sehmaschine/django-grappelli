# coding: utf-8

import re

from django.conf import settings
from django.contrib.auth.models import User
from django.test import TestCase
from django.test.utils import override_settings
from django.utils import timezone

from grappelli.tests.admin import site
from grappelli.tests.models import Category, Entry

# grappelli has to precede django.contrib.admin, otherwise the admin templates
# of django (and not the ones of grappelli) are being used
INSTALLED_APPS_GRAPPELLI_FIRST = ["grappelli"] + [app for app in settings.INSTALLED_APPS if app != "grappelli"]

CHANGELIST_URL = "/admin/grappelli/entry/"

# the changelist options being modified per test
OPTIONS = ("list_per_page", "list_filter", "search_fields", "show_full_result_count")

PAGINATION_RE = re.compile(r'<nav class="grp-pagination">.*?</nav>', re.S)
LINK_RE = re.compile(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', re.S)
CLEAR_FILTERS_RE = re.compile(r'<a[^>]*href="([^"]*)"[^>]*class="[^"]*grp-clear-filters')

Link = tuple[str, str]


@override_settings(ROOT_URLCONF="grappelli.tests.urls")
@override_settings(INSTALLED_APPS=INSTALLED_APPS_GRAPPELLI_FIRST)
class PaginationTests(TestCase):

    def setUp(self) -> None:
        """
        Create a superuser and enough entries to get a paginated changelist
        with a filter being applied
        """
        self.superuser = User.objects.create_superuser('Superuser001', 'superuser001@example.com', 'superuser001')
        self.category_1 = Category.objects.create(name="Category No 1")
        self.category_2 = Category.objects.create(name="Category No 2")
        for i in range(25):
            Entry.objects.create(
                title="Entry No %s" % i,
                category=self.category_1 if i % 2 else self.category_2,
                date=timezone.now(),
                user=self.superuser,
            )

        self.options = site._registry[Entry]
        self.addCleanup(self.restore_options, {name: getattr(self.options, name) for name in OPTIONS})
        self.options.list_per_page = 10
        self.options.list_filter = ("category",)

        self.client.login(username="Superuser001", password="superuser001")

    def restore_options(self, options: dict) -> None:
        for name, value in options.items():
            setattr(self.options, name, value)

    def get_filtered_changelist(self) -> str:
        response = self.client.get(CHANGELIST_URL, {"category__id__exact": self.category_1.pk})
        self.assertEqual(response.status_code, 200)
        return response.content.decode()

    def get_pagination(self, html: str) -> str:
        """
        Return the markup of the first pagination nav
        """
        pagination = PAGINATION_RE.search(html)
        self.assertIsNotNone(pagination, "no pagination found")
        return " ".join(pagination.group(0).split())

    def get_pagination_links(self, html: str) -> list[Link]:
        """
        Return all links of the first pagination nav as (href, text) tuples
        """
        return [(href, " ".join(text.split())) for href, text in LINK_RE.findall(self.get_pagination(html))]

    def test_show_all_link_keeps_filters(self) -> None:
        """
        The pagination provides a single "Show all" link and that link keeps
        the filters being applied
        """
        for show_full_result_count in (True, False):
            with self.subTest(show_full_result_count=show_full_result_count):
                self.options.show_full_result_count = show_full_result_count
                links = self.get_pagination_links(self.get_filtered_changelist())
                show_all = [href for href, text in links if text == "Show all"]
                self.assertEqual(len(show_all), 1, links)
                self.assertIn("all=", show_all[0])
                self.assertIn("category__id__exact=%s" % self.category_1.pk, show_all[0])

    def test_total_links_to_unfiltered_changelist(self) -> None:
        """
        With filters being applied, the total number links to the unfiltered
        changelist (like with Django), see #1090
        """
        self.options.show_full_result_count = True
        links = self.get_pagination_links(self.get_filtered_changelist())
        self.assertEqual([href for href, text in links if text == "25 total"], ["?"], links)

    def test_total_link_keeps_popup(self) -> None:
        """
        Within a related lookup popup, the total link keeps _popup and _to_field,
        but drops the filters
        """
        self.options.show_full_result_count = True
        response = self.client.get(CHANGELIST_URL, {"category__id__exact": self.category_1.pk, "_popup": 1, "_to_field": "id"})
        self.assertEqual(response.status_code, 200)
        links = self.get_pagination_links(response.content.decode())
        total = [href for href, text in links if text == "25 total"]
        self.assertEqual(total, ["?_popup=1&_to_field=id"], links)

    def test_total_is_plain_text_when_unfiltered(self) -> None:
        """
        Without filters, the total number is plain text, also when showing all
        rows (like with Django)
        """
        self.options.show_full_result_count = True
        for params in ({}, {"all": ""}):
            with self.subTest(params=params):
                response = self.client.get(CHANGELIST_URL, params)
                self.assertEqual(response.status_code, 200)
                pagination = self.get_pagination(response.content.decode())
                self.assertIn('<span class="total"> 25 total </span>', pagination)
                self.assertNotIn("25 total", [text for href, text in self.get_pagination_links(response.content.decode())])

    def test_no_reset_link_without_full_result_count(self) -> None:
        """
        Without show_full_result_count, the pagination does not link to the
        unfiltered changelist, because that link would be labelled "Show all"
        as well, see #1087
        """
        self.options.show_full_result_count = False
        links = self.get_pagination_links(self.get_filtered_changelist())
        self.assertEqual([href for href, text in links if href == "?"], [], links)

    def test_result_count(self) -> None:
        """
        The number of results is given with the filters being applied, the
        total number only with show_full_result_count
        """
        self.options.show_full_result_count = True
        pagination = self.get_pagination(self.get_filtered_changelist())
        self.assertIn("12 results", pagination)
        self.assertIn("25 total", pagination)

        self.options.show_full_result_count = False
        pagination = self.get_pagination(self.get_filtered_changelist())
        self.assertIn("12 results", pagination)
        self.assertNotIn("25 total", pagination)

    def test_clear_all_filters_keeps_search(self) -> None:
        """
        Clearing the filters keeps the search query, because the link removes
        the filter params only
        """
        self.options.search_fields = ("title",)
        response = self.client.get(CHANGELIST_URL, {"category__id__exact": self.category_1.pk, "q": "Entry"})
        self.assertEqual(response.status_code, 200)
        clear = CLEAR_FILTERS_RE.search(response.content.decode())
        self.assertIsNotNone(clear, "no clear filters link found")
        self.assertIn("q=Entry", clear.group(1))
        self.assertNotIn("category__id__exact", clear.group(1))

    def test_clear_all_filters_link(self) -> None:
        """
        The filters provide a link to clear them, but only if a filter is
        being applied
        """
        self.assertIsNotNone(CLEAR_FILTERS_RE.search(self.get_filtered_changelist()), "no clear filters link found")

        response = self.client.get(CHANGELIST_URL)
        self.assertIsNone(CLEAR_FILTERS_RE.search(response.content.decode()), "clear filters link without filters")
