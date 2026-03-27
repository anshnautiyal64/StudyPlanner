#ifndef STUDY_PLANNER_UTILS_H
#define STUDY_PLANNER_UTILS_H

#include "Graph.h"
#include <iostream>
#include <string>
#include <vector>

using namespace std;

int promptInt(const string &msg);
string promptString(const string &msg);
Graph buildGraphFromUserInput();

#endif // STUDY_PLANNER_UTILS_H
