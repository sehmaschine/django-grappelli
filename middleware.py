import re 


class JavaScript404Patch():
    """
    Strip obsolete js files that cannot be removed
    (because they are hardcoded in django's core)
    """
    def __init__(self):
        self.strip = ['actions','SelectBox','SelectFilter2','calendar', 'jquery.init',
                      'actions.min', 'DateTimeShortcuts', 'CollapsibleGroup', 'RelatedObjectLookups',
                      'getElementsBySelector', 'js/core', 'CollapsedFieldsets']
        self.re    = re.compile('<script.*(%s).js"></script>\n' % '|'.join(self.strip))
        
    def process_response(self, request, response):
        if(response and "text" in response['Content-Type'] ):
            response.content = self.re.sub('',response.content)
            return response
        else:
            return response

# This should probably be done with browsecap and work based upon available features
# instead of the user agent string alone, but I need something that works right now.
#
# Related code sample: http://www.djangosnippets.org/snippets/267/

class BrowserCompatibilityEnforcer():
    """
    Middleware to disallow access to unwanted user agents (read old shitty browsers)
    """
    def __init__(self):
        # Acceptable
        # Mozilla/5.0 (X11; U; Linux x86_64; en-US) AppleWebKit/533.3 (KHTML, like Gecko) Chrome/5.0.351.0 Safari/533.3
        # Linux x86_64; en-US; rv:1.9.2.2pre) Gecko/20100311 Ubuntu/9.10 (karmic) Namoroka/3.6.2pre
        # Mozilla/5.0 (X11; U; Linux x86_64; en-ca) AppleWebKit/531.2+ (KHTML, like Gecko) Safari/531.2+
        # Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.19 (KHTML, like Gecko) Chrome/1.0.154.48 Safari/525.19
        # Mozilla/5.0 (Windows; U; Windows NT 5.1; fr; rv:1.9.2) Gecko/20100115 Firefox/3.6
        #
        # Stonewalled:
        # Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0; Media Center PC 3.0; .NET CLR 1.0.3705)
        # Mozilla/4.0 (compatible; MSIE 5.5; Windows NT 5.1; Media Center PC 3.0; .NET CLR 1.0.3705)
        # Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; Media Center PC 3.0; .NET CLR 1.0.3705)
        # Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1; Media Center PC 3.0; .NET CLR 1.0.3705)
        self.banned_keywords  = ['Mozilla/4.0', 'MSIE']
        self.allowed_keywords = ['Mozilla/5.0', 'Gecko', 'AppleWebKit', 'Chrome', 'Safari']

    def process_response(self, request, response):
        valid = True
        for keyword in self.banned_keywords:
            if keyword in request.META['HTTP_USER_AGENT']:
                valid = False
        for keyword in self.allowed_keywords:
            if keyword in request.META['HTTP_USER_AGENT']:
                valid = True 

        if not valid and 'noua' not in request.GET:
            from django.conf import settings
            from django.template import loader, Context
            t = loader.get_template('admin/browser_unsupported.html')
            response.content = t.render(Context({'title': settings.GRAPPELLI_ADMIN_TITLE, 'adminmedia': settings.ADMIN_MEDIA_PREFIX}))
        return response

