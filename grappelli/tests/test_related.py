# coding: utf-8

# PYTHON IMPORTS
import datetime

# DJANGO IMPORTS
from django.test import TestCase
from django.test.utils import override_settings
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse
from django.utils import six, translation, timezone

try:
    import json
except ImportError:
    from django.utils import simplejson as json

# GRAPPELLI IMPORTS
from grappelli.tests.models import Category, Entry


@override_settings(GRAPPELLI_AUTOCOMPLETE_LIMIT=10)
@override_settings(GRAPPELLI_AUTOCOMPLETE_SEARCH_FIELDS={})
class RelatedTests(TestCase):

    def setUp(self):
        """
        Create users, categories and entries
        """
        self.superuser_1 = User.objects.create_superuser('Superuser001', 'superuser001@example.com', 'superuser001')
        self.editor_1 = User.objects.create_user('Editor001', 'editor001@example.com', 'editor001')
        self.editor_1.is_staff = True
        self.editor_1.save()
        self.user_1 = User.objects.create_user('User001', 'user001@example.com', 'user001')
        self.user_1.is_staff = False
        self.user_1.save()

        # add categories
        for i in range(100):
            Category.objects.create(name="Category No %s" % (i))

        # add entries
        self.entry_superuser = Entry.objects.create(title="Entry Superuser",
                                                    date=timezone.now(),
                                                    user=self.superuser_1)
        self.entry_editor = Entry.objects.create(title="Entry Editor",
                                                 date=timezone.now(),
                                                 user=self.editor_1)

        # set to en to check error messages
        translation.activate("en")

    def test_setup(self):
        """
        Test setup
        """
        self.assertEqual(User.objects.all().count(), 3)
        self.assertEqual(Category.objects.all().count(), 100)
        self.assertEqual(Entry.objects.all().count(), 2)

    def test_related_lookup(self):
        """
        Test related lookup
        """
        self.client.login(username="User001", password="user001")
        response = self.client.get(reverse("grp_related_lookup"))
        self.assertEqual(response.status_code, 403)

        self.client.login(username="Superuser001", password="superuser001")
        response = self.client.get(reverse("grp_related_lookup"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": None, "label": ""}])

        # ok
        response = self.client.get("%s?object_id=1&app_label=%s&model_name=%s" % (reverse("grp_related_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "Category No 0 (1)"}])

        # wrong object_id
        response = self.client.get("%s?object_id=10000&app_label=%s&model_name=%s" % (reverse("grp_related_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "10000", "label": "?"}])

        # filtered queryset (single filter) fails
        response = self.client.get("%s?object_id=1&app_label=%s&model_name=%s&query_string=id__gte=99" % (reverse("grp_related_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "?"}])

        # filtered queryset (single filter) works
        response = self.client.get("%s?object_id=100&app_label=%s&model_name=%s&query_string=id__gte=99" % (reverse("grp_related_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "100", "label": "Category No 99 (100)"}])

        # filtered queryset (multiple filters) fails
        response = self.client.get("%s?object_id=1&app_label=%s&model_name=%s&query_string=name__icontains=99:id__gte=99" % (reverse("grp_related_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "?"}])

        # filtered queryset (multiple filters) works
        response = self.client.get("%s?object_id=100&app_label=%s&model_name=%s&query_string=name__icontains=99:id__gte=99" % (reverse("grp_related_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "100", "label": "Category No 99 (100)"}])

        # custom queryset (Superuser)
        response = self.client.get("%s?object_id=1&app_label=%s&model_name=%s" % (reverse("grp_related_lookup"), "grappelli", "entry"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "Entry Superuser"}])
        response = self.client.get("%s?object_id=2&app_label=%s&model_name=%s" % (reverse("grp_related_lookup"), "grappelli", "entry"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "2", "label": "Entry Editor"}])

        # custom queryset (Editor)
        # FIXME: this should fail, because the custom admin queryset
        # limits the entry to the logged in user (but we currently do not make use
        # of custom admin querysets)
        self.client.login(username="Editor001", password="editor001")
        response = self.client.get("%s?object_id=1&app_label=%s&model_name=%s" % (reverse("grp_related_lookup"), "grappelli", "entry"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "Entry Superuser"}])

        # wrong app_label/model_name
        response = self.client.get("%s?object_id=1&app_label=false&model_name=false" % (reverse("grp_related_lookup")))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": None, "label": ""}])
        response = self.client.get("%s?object_id=&app_label=false&model_name=false" % (reverse("grp_related_lookup")))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": None, "label": ""}])

    def test_m2m_lookup(self):
        """
        Test M2M lookup
        """
        self.client.login(username="User001", password="user001")
        response = self.client.get(reverse("grp_related_lookup"))
        self.assertEqual(response.status_code, 403)

        self.client.login(username="Superuser001", password="superuser001")
        response = self.client.get(reverse("grp_related_lookup"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": None, "label": ""}])

        # ok (single)
        response = self.client.get("%s?object_id=1&app_label=%s&model_name=%s" % (reverse("grp_m2m_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "Category No 0 (1)"}])

        # wrong object_id (single)
        response = self.client.get("%s?object_id=10000&app_label=%s&model_name=%s" % (reverse("grp_m2m_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "10000", "label": "?"}])

        # ok (multiple)
        response = self.client.get("%s?object_id=1,2,3&app_label=%s&model_name=%s" % (reverse("grp_m2m_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "Category No 0 (1)"}, {"value": "2", "label": "Category No 1 (2)"}, {"value": "3", "label": "Category No 2 (3)"}])

        # wrong object_id (multiple)
        response = self.client.get("%s?object_id=1,10000,3&app_label=%s&model_name=%s" % (reverse("grp_m2m_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "Category No 0 (1)"}, {"value": "10000", "label": "?"}, {"value": "3", "label": "Category No 2 (3)"}])

        # filtered queryset (single filter) fails
        response = self.client.get("%s?object_id=1,2,3&app_label=%s&model_name=%s&query_string=id__gte=99" % (reverse("grp_m2m_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "?"}, {"value": "2", "label": "?"}, {"value": "3", "label": "?"}])

        # filtered queryset (single filter) works
        response = self.client.get("%s?object_id=1,2,3&app_label=%s&model_name=%s&query_string=id__lte=3" % (reverse("grp_m2m_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "Category No 0 (1)"}, {"value": "2", "label": "Category No 1 (2)"}, {"value": "3", "label": "Category No 2 (3)"}])

        # filtered queryset (multiple filters) fails
        response = self.client.get("%s?object_id=1,2,3&app_label=%s&model_name=%s&query_string=name__icontains=99:id__gte=99" % (reverse("grp_m2m_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "?"}, {"value": "2", "label": "?"}, {"value": "3", "label": "?"}])

        # filtered queryset (multiple filters) works
        response = self.client.get("%s?object_id=1,2,3&app_label=%s&model_name=%s&query_string=name__icontains=Category:id__lte=3" % (reverse("grp_m2m_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": "1", "label": "Category No 0 (1)"}, {"value": "2", "label": "Category No 1 (2)"}, {"value": "3", "label": "Category No 2 (3)"}])

    def test_autocomplete_lookup(self):
        """
        Test autocomplete lookup
        """
        self.client.login(username="User001", password="user001")
        response = self.client.get(reverse("grp_related_lookup"))
        self.assertEqual(response.status_code, 403)

        self.client.login(username="Superuser001", password="superuser001")
        response = self.client.get(reverse("grp_related_lookup"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": None, "label": ""}])

        # term not found
        response = self.client.get("%s?term=XXXXXXXXXX&app_label=%s&model_name=%s" % (reverse("grp_autocomplete_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": None, "label": "0 results"}])

        # ok (99 finds the id and the title, therefore 2 results)
        response = self.client.get("%s?term=Category No 99&app_label=%s&model_name=%s" % (reverse("grp_autocomplete_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": 99, "label": "Category No 98 (99)"}, {"value": 100, "label": "Category No 99 (100)"}])

        # filtered queryset (single filter)
        response = self.client.get("%s?term=Category&app_label=%s&model_name=%s&query_string=id__gte=99" % (reverse("grp_autocomplete_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": 99, "label": "Category No 98 (99)"}, {"value": 100, "label": "Category No 99 (100)"}])

        # filtered queryset (multiple filters)
        response = self.client.get("%s?term=Category&app_label=%s&model_name=%s&query_string=name__icontains=99:id__gte=99" % (reverse("grp_autocomplete_lookup"), "grappelli", "category"))
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content.decode('utf-8'), [{"value": 100, "label": "Category No 99 (100)"}])
