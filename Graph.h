#ifndef STUDY_PLANNER_GRAPH_H
#define STUDY_PLANNER_GRAPH_H

#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

using namespace std;
class Graph {
public:
    Graph();
    ~Graph();

    void addSubject(const string &name);
    void addEdge(const string &from, const string &to);
    void setNodeWeight(const string &name, int weight);
    int getNodeWeight(const string &name) const;

    vector<string> getNodes() const;
    const unordered_map<string, unordered_map<string, int>>& getAdjList() const;
    const unordered_map<string, int>& getIndegree() const;
private:
    unordered_map<string, unordered_map<string, int>> adjacency;
    unordered_map<string, int> indegree;
    unordered_map<string, int> nodeWeights;
};
#endif
