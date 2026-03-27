#include "Graph.h"
#include <stdexcept>
using namespace std;
Graph::Graph() {}
Graph::~Graph() {}
void Graph::addSubject(const string &name) {
    if (name.empty()) {
        throw invalid_argument("Subject name cannot be empty");
    }
    if (adjacency.find(name) == adjacency.end()) {
        adjacency[name] = unordered_map<string, int>();
        indegree[name] = 0;
        nodeWeights[name] = 0; 
    }
}
void Graph::addEdge(const string &from, const string &to) {
    if (from.empty() || to.empty()) {
        throw invalid_argument("Subject name in prerequisite cannot be empty");
    }
    if (from == to) {
        throw invalid_argument("Self-dependency is not allowed: " + from);
    }
    if (adjacency.find(from) == adjacency.end()) {
        throw invalid_argument("Unknown subject in edge: " + from);
    }
    if (adjacency.find(to) == adjacency.end()) {
        throw invalid_argument("Unknown subject in edge: " + to);
    }

    adjacency[from][to] = nodeWeights[to];
    indegree[to] += 1;
}
void Graph::setNodeWeight(const string &name, int weight) {
    if (weight <= 0) {
        throw invalid_argument("Weight must be positive");
    }
    if (nodeWeights.find(name) == nodeWeights.end()) {
        throw invalid_argument("Subject not found: " + name);
    }
    nodeWeights[name] = weight;
}

vector<string> Graph::getNodes() const {
    vector<string> nodes;
    nodes.reserve(adjacency.size());
    for (auto &entry : adjacency) {
        nodes.push_back(entry.first);
    }
    return nodes;
}
const unordered_map<string, unordered_map<string, int>>& Graph::getAdjList() const {
    return adjacency;
}

const unordered_map<string, int>& Graph::getIndegree() const {
    return indegree;
}
