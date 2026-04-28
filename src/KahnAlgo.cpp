#include "KahnAlgo.h"
#include <queue>
#include <stdexcept>
#include <algorithm>

using namespace std;
bool detectCycleDFS(const string &node, 
                    const unordered_map<string, unordered_map<string, int>> &adj,
                    unordered_map<string, int> &visitState,
                    vector<string> &path,
                    const unordered_map<string, int> &indegreeTracker) {
    visitState[node] = 1; 
    path.push_back(node);
    
    auto it = adj.find(node);
    if (it != adj.end()) {
        for (const auto &p : it->second) {
            string neighbor = p.first;
            
            if (indegreeTracker.at(neighbor) > 0) {
                if (visitState[neighbor] == 1) { 
                    path.push_back(neighbor);
                    return true;
                } else if (visitState[neighbor] == 0) {
                    if (detectCycleDFS(neighbor, adj, visitState, path, indegreeTracker)) {
                        return true;
                    }
                }
            }
        }
    }
    
    visitState[node] = 2; 
    path.pop_back();
    return false;
}


TopoResult runKahnTopologicalSort(const Graph &graph) {
    TopoResult result;
    result.hasCycle = false;
    result.maxCredits = 0;

    auto nodes = graph.getNodes();
    const auto &adj = graph.getAdjList();
    const auto &indeg = graph.getIndegree();

    if (nodes.empty()) {
        throw invalid_argument("Graph has no subjects to schedule");
    }

    unordered_map<string, int> indegreeCopy;
    for (auto &entry : indeg) {
        indegreeCopy[entry.first] = entry.second;
    }

    priority_queue<pair<int, string>, vector<pair<int, string>>, greater<>> pq;
    
    unordered_map<string, int> dist;
    unordered_map<string, string> parent;

    for (const auto &name : nodes) {
        dist[name] = graph.getNodeWeight(name);
        parent[name] = "";
        if (indegreeCopy[name] == 0) {
            pq.push({graph.getNodeWeight(name), name});
        }
    }

    while (!pq.empty()) {
        string current = pq.top().second;
        pq.pop();
        
        result.order.push_back(current);

        auto it = adj.find(current);
        if (it == adj.end()) {
            continue;
        }

        for (const auto &p : it->second) {
            string neighbor = p.first;
    
            int weightOfNeighbor = graph.getNodeWeight(neighbor);
            if (dist[current] + weightOfNeighbor > dist[neighbor]) {
                dist[neighbor] = dist[current] + weightOfNeighbor;
                parent[neighbor] = current;
            }
            
            indegreeCopy[neighbor] -= 1;
            if (indegreeCopy[neighbor] == 0) {
                pq.push({graph.getNodeWeight(neighbor), neighbor});
            }
        }
    }

    if ((int)result.order.size() != (int)nodes.size()) {
        result.hasCycle = true;
        unordered_map<string, int> visitState;
        for (const auto &name : nodes) visitState[name] = 0;
        
        vector<string> tempPath;
        for (const auto &name : nodes) {
            if (indegreeCopy[name] > 0 && visitState[name] == 0) {
                if (detectCycleDFS(name, adj, visitState, tempPath, indegreeCopy)) {
                    string cycleStart = tempPath.back();
                    bool started = false;
                    for (const string &n : tempPath) {
                        if (n == cycleStart) started = true;
                        if (started) result.cyclePath.push_back(n);
                    }
                    break;
                }
            }
        }
    } else {

        string endNode = "";
        int maxLen = -1;
        for (const auto &entry : dist) {
            if (entry.second > maxLen) {
                maxLen = entry.second;
                endNode = entry.first;
            }
        }
        
        result.maxCredits = maxLen;
        vector<string> cPath;
        while (endNode != "") {
            cPath.push_back(endNode);
            endNode = parent[endNode];
        }
        reverse(cPath.begin(), cPath.end());
        result.criticalPath = cPath;
    }

    return result;
}
