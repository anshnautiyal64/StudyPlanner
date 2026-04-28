#include "Graph.h"
#include <stdexcept>
#include <algorithm>

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
        nodeWeights[name] = 0; // Default weight is 0
    }
}

void Graph::removeSubject(const string &name) {
    if (adjacency.find(name) == adjacency.end()) {
        throw invalid_argument("Subject not found: " + name);
    }
    
    // 1. Decrease indegree of all neighbors that 'name' pointed to
    for (const auto &neighbor_pair : adjacency[name]) {
        indegree[neighbor_pair.first] -= 1;
    }
    
    // 2. Remove name from ALL other subjects outgoing edge lists
    for (auto &entry : adjacency) {
        if (entry.second.find(name) != entry.second.end()) {
            entry.second.erase(name);
        }
    }

    // 3. Erase name from adjacency, indegree and nodeWeights maps
    adjacency.erase(name);
    indegree.erase(name);
    nodeWeights.erase(name);
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

    if (adjacency[from].find(to) == adjacency[from].end()) {
        adjacency[from][to] = nodeWeights[to];
        indegree[to] += 1;
    }
}

void Graph::setNodeWeight(const string &name, int weight) {
    if (weight < 0) {
        throw invalid_argument("Weight must be non-negative");
    }
    if (nodeWeights.find(name) == nodeWeights.end()) {
        throw invalid_argument("Subject not found: " + name);
    }
    nodeWeights[name] = weight;
    
    // Update edge weights internally
    for (auto &entry : adjacency) {
        if (entry.second.find(name) != entry.second.end()) {
            entry.second[name] = weight;
        }
    }
}

int Graph::getNodeWeight(const string &name) const {
    auto it = nodeWeights.find(name);
    if (it != nodeWeights.end()) {
        return it->second;
    }
    return 0;
}

vector<string> Graph::getNodes() const {
    vector<string> nodes;
    nodes.reserve(adjacency.size());
    for (auto &entry : adjacency) {
        nodes.push_back(entry.first);
    }
    return nodes;
}

vector<string> Graph::getPrerequisites(const string &name) const {
    if (adjacency.find(name) == adjacency.end()) {
        throw invalid_argument("Subject not found: " + name);
    }
    vector<string> prereqs;
    for (const auto &entry : adjacency) {
        if (entry.second.find(name) != entry.second.end()) {
            prereqs.push_back(entry.first);
        }
    }
    return prereqs;
}

const unordered_map<string, unordered_map<string, int>>& Graph::getAdjList() const {
    return adjacency;
}

const unordered_map<string, int>& Graph::getIndegree() const {
    return indegree;
}
