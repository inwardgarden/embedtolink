/*

Extension based on the following MIT licensed userscript:
https://greasyfork.org/en/scripts/1590-no-embed-youtube

MIT LICENSE

Copyright (c) eight04
Copyright (c) inward.garden

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/



"use strict";
     
    var xpath = `(
    	//iframe[
    		contains(@src, 'youtube.com/embed/') or
    		contains(@src, 'youtube.com/v/') or
    		contains(@src, 'youtube-nocookie.com/embed/') or
    		contains(@src, 'youtube-nocookie.com/v/') or
    		contains(@data-src, 'youtube.com/embed/') or
    		contains(@src, 'vimeo.com/video')
    	] |
    	//object[./param[contains(@value, 'youtube.com/v/')]] |
      //object[./param[contains(@value, 'youtube-nocookie.com/v/')]] |
    	//embed[
    		contains(@src, 'youtube.com/v/') and
    		not(ancestor::object)
    	]
    )[not(ancestor::*[@id='YTLT-player'])]`;
     
    const patterns = [
    	{
        test: /youtube(-nocookie)?\.com\/(embed|v)\/(.+?)(\?|&|$)/,
        repl: match => `https://www.youtube.com/watch?v=${match[3]}`
      },
      {
        test: /vimeo\.com\/video\/(\d+)/,
        repl: match => `https://vimeo.com/${match[1]}`
      }
    ];
     
    var unEmbed = function(node){
     
    	var result = document.evaluate(
    		xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
     
    	var element = null;
    	var i = 0, j;
     
    	while ((element = result.snapshotItem(i++))) {
     
    		// iframe or embed
    		var url = element.src || element.dataset.src;
     
    		// object
    		if(!url){
    			for(j = 0; j < element.childNodes.length; j++){
    				var pa = element.childNodes[j];
    				if(pa.nodeName == "PARAM" && pa.getAttribute("name") == "movie"){
    					url = pa.getAttribute("value");
    					break;
    				}
    			}
    		}
     
    		if(!url){
    			continue;
    		}
     
        for (const pattern of patterns) {
          const match = url.match(pattern.test);
          if (!match) continue;
          const newUrl = pattern.repl(match);
          var a = document.createElement("a");
          a.textContent = newUrl;
          a.href = newUrl;
          a.target = "_blank";
          a.className = "unembed";
          element.parentNode.replaceChild(a, element);
          break;
        }
    	}
    };
     
    new MutationObserver(function(){
    	if (document.body) {
    		unEmbed(document.body);
    	}
    }).observe(document, {
    	childList: true,
    	subtree: true
    });



