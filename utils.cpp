#include "utils.h"
#include <sstream>
using namespace std;

int promptInt(const string &msg) {
    cout << msg;
    int val;
    cin >> val;
    cin.ignore();
    return val;
}

string promptString(const string &msg) {
    cout << msg;
    string s;
    getline(cin, s);
    return s;
}

Graph buildGraphFromUserInput() {
    Graph graph;

    int n = promptInt("Enter number of subjects: ");
    for (int i = 0; i < n; ++i)
        graph.addSubject(promptString("Subject " + to_string(i + 1) + ": "));

    int m = promptInt("Enter number of prerequisites: ");
    for (int i = 0; i < m; ++i) {
        string line = promptString("Pair " + to_string(i + 1) + " (A B): ");
        stringstream ss(line);
        string a, b;
        ss >> a >> b;
        graph.addEdge(a, b);
    }

    return graph;
}
