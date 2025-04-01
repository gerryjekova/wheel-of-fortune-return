using System;

public class CPHInline
{
    public bool Execute()
    {
        // (1) Get Temp Global "wh"
            int wh = CPH.GetGlobalVar<int>("wh", false);
        
        
        
        // (2) Get Temp Global "sp"
            int sp = CPH.GetGlobalVar<int>("sp", false);
        
        // divider (5 in your case)
        int divider = 5;

        // (3) "a" = "sp" / "divider"
            int a = sp / divider;
            
            
        // (4) "b" = "sp" %  "divider" (whats left from dividing "sp" by "divider")
            int b = sp % divider;
            
            
        // (5) "c" = "wh" + "a"
            int c = wh + a;
            
            
            
        // Set Argument
        CPH.SetArgument("c", c);
        
        // Set Temp Global "wh" to "c"
        CPH.SetGlobalVar("wh", c, false);
        
        // Set Temp Global "sp" to "b"
        CPH.SetGlobalVar("sp", b, false);
        
        return true;
    }
}
