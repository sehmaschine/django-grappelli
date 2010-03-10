import re 


class JavaScript404Patch():
    """
    Strip obsolete js files that cannot be removed
    (because they are hardcoded in django's core)
    """
    def __init__(self):
        self.strip = ['actions','SelectBox','SelectFilter2','calendar',
                      'DateTimeShortcuts', 'CollapsibleGroup', 'RelatedObjectLookups',
                      'getElementsBySelector', 'js/core']
        self.re    = re.compile('<script.*(%s).js"></script>\n' % '|'.join(self.strip))
        
    def process_response(self, request, response):
        if("text" in response['Content-Type'] ):
            response.content = self.re.sub('',response.content)
            return response
        else:
            return response
