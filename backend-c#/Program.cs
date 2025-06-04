using System;

// 1. הגדרת דלגייט: מגדיר את החתימה של המתודות שהוא יכול להחזיק.
// בדוגמה זו: מתודה שלא מחזירה כלום ומקבלת string אחד.
public delegate void MyPrinter(string message);

public class Messenger
{
    public void PrintToConsole(string text)
    {
        Console.WriteLine($"Console Print: {text}");
    }
    Q

    public void PrintToLogFile(string text)
    {
        Console.WriteLine($"Log File Print: {text}"); // בדוגמה, מדפיס לקונסול כדי להדגים
    }

    public void SendMessage(string msg, MyPrinter printerDelegate)
    {
        // המתודה SendMessage מקבלת דלגייט כפרמטר
        // והיא קוראת למתודה שהדלגייט "מצביע" עליה.
        printerDelegate(msg);
    }
}

// The entry point of a C# console application is typically a static void Main method.
public class Program
{
    public static void Main(string[] args)
    {
        Messenger messenger = new Messenger();

        // Create a delegate instance pointing to the PrintToConsole method
        MyPrinter consolePrinter = new MyPrinter(messenger.PrintToConsole);
        messenger.SendMessage("Hello from console!", consolePrinter);

        // Create another delegate instance pointing to the PrintToLogFile method
        // This is a shorthand syntax available since C# 2.0+
        MyPrinter logPrinter = messenger.PrintToLogFile;
        messenger.SendMessage("Hello from log file!", logPrinter);

        // A delegate can hold multiple methods (Multicast Delegate)
        // When a multicast delegate is invoked, all the methods it points to are called
        MyPrinter combinedPrinter = consolePrinter + logPrinter;
        messenger.SendMessage("Hello from both!", combinedPrinter);

        // You can also remove a method from a multicast delegate
        MyPrinter removedConsolePrinter = combinedPrinter - consolePrinter;
        messenger.SendMessage("Hello from log only (after removing console printer)!", removedConsolePrinter);
    }
}
