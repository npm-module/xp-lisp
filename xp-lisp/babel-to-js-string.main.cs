// Project Name: babel-to-js-string.main.cs
//+#nuget Global.Sys
using Global;
using System;
using System.IO;
using System.Text;
using static Global.EasyObject;
using static Global.Sys;

Global.Sys.SetupConsoleUTF8();
Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
Encoding shiftJisEncoding = Encoding.GetEncoding("Shift_JIS");
try
{
    ShowDetail = true;
    Log("ハロー©");
    Log(new { args });
    string babelSource = File.ReadAllText("https_cdn.jsdelivr.net_npm_@babel-standalone@7.28.6_babel.js");
    //Log(babelSource);
    var eo = FromObject(babelSource);
    var json = eo.ToJson();
    File.WriteAllText("https_cdn.jsdelivr.net_npm_@babel-standalone@7.28.6_babel.js.json", json);
}
catch (Exception e)
{
    Crash(e);
}
