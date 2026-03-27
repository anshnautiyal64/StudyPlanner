#include "KahnAlgo.h"
#include <queue>
#include <stdexcept>

using namespace std;

TopoResult runKahnTopologicalSort(const Graph &graph) {
    TopoResult result;
    result.hasCycle = false;

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

    queue<string> q;
    for (auto &name : nodes) {
        if (indegreeCopy[name] == 0) {
            q.push(name);
        }
    }

    while (!q.empty()) {
        string current = q.front();
        q.pop();
        result.order.push_back(current);

        auto it = adj.find(current);
        if (it == adj.end()) {
            continue;
        }

        for (const auto &p : it->second) {
            string neighbor = p.first;
            indegreeCopy[neighbor] -= 1;
            if (indegreeCopy[neighbor] == 0) {
                q.push(neighbor);
            }
        }
    }

    if ((int)result.order.size() != (int)nodes.size()) {
        result.hasCycle = true;
    }

    return result;
}
