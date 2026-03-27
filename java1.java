import java.util.Scanner;
class check extends Exception{
	check(String msg){
	super(msg);
	}
}
class mycalculator{
    void cal(int n,int p){
        if(n<0 || p<0){
            throw new check("n and p should be non- negative");
        }
        else{
            int ans=n*p;
            System.out.println("the product is: "+ans);
        }
    }
}
public class java2{
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        System.out.println("enter the value of n and p");
        int n=sc.nextInt();
        int p=sc.nextInt();
        mycalculator obj=new mycalculator();
        try{
            obj.cal(n, p);
        }
        catch(check e){
            System.out.println(e.getMessage());
        }
    }
}
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

long long maxUnits(vector<long> boxes, vector<long> unitsPerBox, long truckSize)
{
    int n = boxes.size();

    vector<pair<long,long>> v;

    for(int i = 0; i < n; i++)
    {
        v.push_back({unitsPerBox[i], boxes[i]});
    }

    sort(v.begin(), v.end(), greater<pair<long,long>>());

    long long totalUnits = 0;

    for(int i = 0; i < n && truckSize > 0; i++)
    {
        //long take = min(v[i].second, truckSize);

        totalUnits += min(v[i].second, truckSize)* v[i].first;

        truckSize -= min(v[i].second, truckSize);
    }
    return totalUnits;
}

int main()
{
    int n;
    cin >> n;

    vector<long> boxes(n);
    vector<long> unitsPerBox(n);

    for(int i = 0; i < n; i++)
        cin >> boxes[i];

    for(int i = 0; i < n; i++)
        cin >> unitsPerBox[i];

    long truckSize;
    cin >> truckSize;

    cout << maxUnits(boxes, unitsPerBox, truckSize);

    return 0;
}
