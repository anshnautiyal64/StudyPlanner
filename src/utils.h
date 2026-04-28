#ifndef STUDY_PLANNER_UTILS_H
#define STUDY_PLANNER_UTILS_H

#include "Graph.h"
#include <string>
#include <vector>

using namespace std;

vector<vector<string>> generateWeeklyPlan(
    const vector<string> &topoOrder,
    const Graph &graph,
    int maxCreditsPerWeek
);

bool checkPrerequisite(
    const Graph &graph,
    const string &subject,
    const vector<string> &completed
);

#endif 
