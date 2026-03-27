#ifndef STUDY_PLANNER_KAHN_ALGO_H
#define STUDY_PLANNER_KAHN_ALGO_H

#include "Graph.h"
#include <vector>
#include <string>

using namespace std;
struct TopoResult {
    bool hasCycle;
    vector<string> order;
};

TopoResult runKahnTopologicalSort(const Graph &graph);

#endif 