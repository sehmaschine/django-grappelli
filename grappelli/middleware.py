# coding: utf-8

# python imports
import re 


class JavaScript404Patch():
    """
    Strip obsolete js files that cannot be removed
    (because they are hardcoded in django's core)
    """
    def __init__(self):
        self.strip = ['js/jquery.min', 'js/actions.min', 'js/collapse.min', 'js/calendar']
        self.re = re.compile('<script.*(%s).js"></script>\n' % '|'.join(self.strip))
        
    def process_response(self, request, response):
        if(response and "text" in response['Content-Type'] ):
            response.content = self.re.sub('',response.content)
            return response
        else:
            return response


