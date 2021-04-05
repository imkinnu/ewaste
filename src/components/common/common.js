export function setParams(params){
    var esc = encodeURIComponent;
    var query= Object.keys(params)
       .map(k => esc(k) + '=' + esc(params[k]))
       .join('&');
     return query;
 }