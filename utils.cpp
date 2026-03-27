#include "utils.h"
#include <sstream>
#include <stdexcept>
using namespace std;
int promptInt(const string &msg) {
    cout << msg;
    string line;
    if (!getline(cin, line)) {
        throw runtime_error("Failed to read integer input");
    }
    if (line.empty()) {
        throw invalid_argument("Expected a number but got empty line");
    }
    stringstream ss(line);
    int val;
    ss >> val;
    if (ss.fail() || !ss.eof()) {
        throw invalid_argument("Invalid integer: " + line);
    }
    if (val < 0) {
        throw invalid_argument("Number must be non-negative");
    }
    return val;
}
string promptString(const string &msg) {
    cout << msg;
    string s;
    if (!getline(cin, s)) {
        throw runtime_error("Failed to read string input");
    }
    return s;
}
Graph buildGraphFromUserInput() {
    Graph graph;
    int n = promptInt("Enter number of subjects: ");
    if (n <= 0) {
        throw invalid_argument("Number of subjects must be positive");
    }
    cout << "Enter subject names:" << endl;
    for (int i = 0; i < n; ++i) {
        string name = promptString("Subject " + to_string(i + 1) + ": ");
        if (name.empty()) {
            throw invalid_argument("Invalid subject name");
        }
        graph.addSubject(name);
    }
    int m = promptInt("Enter number of prerequisites: ");
    if (m < 0) {
        throw invalid_argument("Prerequisite count cannot be negative");
    }
    cout << "Enter prerequisites as pairs (A B means A before B):" << endl;
    for (int i = 0; i < m; ++i) {
        string line = promptString("Pair " + to_string(i + 1) + ": ");
        stringstream ss(line);
        string a,b;
        ss >> a >> b;
        if (a.empty() || b.empty()) {
            throw invalid_argument("Prerequisite pair must contain two subject names");
        }
        graph.addEdge(a, b);
    }
    return graph;
}
