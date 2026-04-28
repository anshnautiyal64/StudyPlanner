#include "Graph.h"
#include "KahnAlgo.h"
#include "utils.h"
#include <iostream>
#include <string>
#include <vector>
#include <stdexcept>

using namespace std;

string escapeJSON(const string& s) {
    string escaped;
    for (char c : s) {
        if (c == '"') escaped += "\\\"";
        else if (c == '\\') escaped += "\\\\";
        else escaped += c;
    }
    return escaped;
}

string jsonGetString(const string &json, const string &key) {
    string searchKey = "\"" + key + "\":";
    size_t pos = json.find(searchKey);
    if (pos == string::npos) return "";
    
    pos += searchKey.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t' || json[pos] == '\n' || json[pos] == '\r')) pos++;
    
    if (pos >= json.length() || json[pos] != '"') return "";
    pos++;
    
    size_t endPos = json.find("\"", pos);
    if (endPos == string::npos) return "";
    
    return json.substr(pos, endPos - pos);
}  
int jsonGetInt(const string &json, const string &key, int defaultVal) {
    string searchKey = "\"" + key + "\":";
    size_t pos = json.find(searchKey);
    if (pos == string::npos) return defaultVal;
    
    pos += searchKey.length();
    while (pos < json.length() && (json[pos] == ' ' || json[pos] == '\t' || json[pos] == '\n' || json[pos] == '\r')) pos++;
    
    size_t endPos = pos;
    while (endPos < json.length() && json[endPos] >= '0' && json[endPos] <= '9') endPos++;
    
    if (endPos == pos) return defaultVal;
    
    try {
        return stoi(json.substr(pos, endPos - pos));
    } catch (...) {
        return defaultVal;
    }
}

vector<string> jsonGetArray(const string &json, const string &key) {
    vector<string> result;
    string searchKey = "\"" + key + "\":";
    size_t pos = json.find(searchKey);
    if (pos == string::npos) return result;
    
    pos = json.find("[", pos);
    if (pos == string::npos) return result;
    
    size_t endPos = json.find("]", pos);
    if (endPos == string::npos) return result;
    
    string arrayStr = json.substr(pos + 1, endPos - pos - 1);
    
    size_t objStart = 0;
    while ((objStart = arrayStr.find("{", objStart)) != string::npos) {
        size_t objEnd = arrayStr.find("}", objStart);
        if (objEnd != string::npos) {
            result.push_back(arrayStr.substr(objStart, objEnd - objStart + 1));
            objStart = objEnd + 1;
        } else {
            break;
        }
    }
    return result;
}

int main(int argc, char* argv[]) {
    try {
        if (argc < 2) {
            throw runtime_error("Missing JSON input argument.");
        }
        
        string inputJson = argv[1];
        Graph graph;
        
        int maxCreditsPerWeek = jsonGetInt(inputJson, "maxCreditsPerWeek", 10);
        
        vector<string> subjectsJson = jsonGetArray(inputJson, "subjects");
        for (const string &sJson : subjectsJson) {
            string name = jsonGetString(sJson, "name");
            int weight = jsonGetInt(sJson, "weight", 0);
            if (!name.empty()) {
                graph.addSubject(name);
                graph.setNodeWeight(name, weight);
            }
        }
        
        vector<string> edgesJson = jsonGetArray(inputJson, "edges");
        for (const string &eJson : edgesJson) {
            string from = jsonGetString(eJson, "from");
            string to = jsonGetString(eJson, "to");
            if (!from.empty() && !to.empty()) {
                graph.addEdge(from, to);
            }
        }
        
        TopoResult result = runKahnTopologicalSort(graph);
        
        string out = "{";
        if (result.hasCycle) {
            out += "\"hasCycle\":true,";
            out += "\"order\":[],\"criticalPath\":[],\"maxCredits\":0,";
            out += "\"cyclePath\":[";
            for (size_t i = 0; i < result.cyclePath.size(); ++i) {
                out += "\"" + escapeJSON(result.cyclePath[i]) + "\"";
                if (i < result.cyclePath.size() - 1) out += ",";
            }
            out += "],\"weeklyPlan\":[]";
        } else {
            out += "\"hasCycle\":false,";
            
            out += "\"order\":[";
            for (size_t i = 0; i < result.order.size(); ++i) {
                out += "\"" + escapeJSON(result.order[i]) + "\"";
                if (i < result.order.size() - 1) out += ",";
            }
            out += "],";
            
            out += "\"criticalPath\":[";
            for (size_t i = 0; i < result.criticalPath.size(); ++i) {
                out += "\"" + escapeJSON(result.criticalPath[i]) + "\"";
                if (i < result.criticalPath.size() - 1) out += ",";
            }
            out += "],";
            
            out += "\"maxCredits\":" + to_string(result.maxCredits) + ",";
            
            out += "\"cyclePath\":[],";
            
            out += "\"weeklyPlan\":[";
            vector<vector<string>> weeks = generateWeeklyPlan(result.order, graph, maxCreditsPerWeek);
            for (size_t i = 0; i < weeks.size(); ++i) {
                out += "{\"week\":" + to_string(i + 1) + ",\"subjects\":[";
                int weekCredits = 0;
                for (size_t j = 0; j < weeks[i].size(); ++j) {
                    out += "\"" + escapeJSON(weeks[i][j]) + "\"";
                    if (j < weeks[i].size() - 1) out += ",";
                    weekCredits += graph.getNodeWeight(weeks[i][j]);
                }
                out += "],\"totalCredits\":" + to_string(weekCredits) + "}";
                if (i < weeks.size() - 1) out += ",";
            }
            out += "]";
        }
        out += "}";
        
        cout << out << endl;
        
    } catch (const exception &e) {
        cout << "{\"error\":\"" << escapeJSON(e.what()) << "\",\"hasCycle\":false}" << endl;
    }
    
    return 0;
}
