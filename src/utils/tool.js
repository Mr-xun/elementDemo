export function fmoney(s, n) {
  if (s) 
  {
  if(s==0)
    {return ""}
  n = n > 0 && n <= 20 ? n : 2;
  s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
  var l = s.split(".")[0].split("").reverse(),
    r = s.split(".")[1];
  var t = "";
  for (var i = 0; i < l.length; i++) {
    t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
  }
  return t.split("").reverse().join("") + "." + r;
  }
  else
  {return ""}
}
export function roundx(s, n) {
  n = Math.round(n)
  n = (n >= -6 && n <= 6) ? Math.round(n) : 2;
  var m=Math.pow(10,n)
  return m!=0?Math.round(s*m)/m:s 
}
export function getRowByKeyVal(d,k,v) //根据指定键值获取元素
{
    var len=d.length
    for(var i=0; i<len;i++)
    { 
        if (d[i][k]==v)
        {  
            return d[i]; 
        }
    }
    return []
}
export function getDataByKeyVal(d,k,v,f) //根据主键k v值获取字段f的位置
{
    var len=d.length
    for(var i=0; i<len;i++)
    { 
        if (d[i][k]==v)
        {  
            return d[i][f]; 
        }
    }
    return 
}
export function evals(formual, A, B, C, D, E, F) {
  return eval(formual);
}
export function getBdvalue(data,key,basedata_name,depot_id,materie_id)
{//根据bd表找到
  return;
}
export function getMaterial(data,key,depot_id,materie_id)
{//根据物料id找物料
  return;
}
export function copyRowToBak(r,d,k) //把指定列复制一份到备份数组, 需排重
{
    var row_was_in_bak=false
    for(var i=0;i<d.length;i++)
    {//行在列表中存在么，
        if(d[i][k]==r[k])
        {
            row_was_in_bak=true
            return;
        }
    }
    if(row_was_in_bak==false) 
    {
        var row_copy=JSON.parse(JSON.stringify(r));//拷贝内容而不是引用
        d.push(row_copy);
    }
}

export function left(s,l) { 
    if (l>0) {return s.substring(0,l)} 
    else{return null} 
    }  
   
export   function right(s,l) { 
    if (s.length-l>=0 && s.length>=0 && s.length-l<=s.length) { 
    return s.substring(s.length-l,s.length)} 
    else{return null} 
    } 
export   function mid(s,starnum,endnum){ 
    if (s.length>=0){ 
    return s.substr(starnum,endnum) 
    }else{return null} 
    }
 