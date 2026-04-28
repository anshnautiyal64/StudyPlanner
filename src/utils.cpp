#include "utils.h"
#include <algorithm>
#include <stdexcept>

using namespace std;

vector<vector<string>> generateWeeklyPlan(
    const vector<string> &topoOrder,
    const Graph &graph,
    int maxCreditsPerWeek
) {
    vector<vector<string>> weeks;
    if (topoOrder.empty()) return weeks;

    vector<string> currentWeekSubjects;
    int currentCredits = 0;

    for (const string &subject : topoOrder) {
        int weight = graph.getNodeWeight(subject);
        
        if (currentCredits + weight > maxCreditsPerWeek && !currentWeekSubjects.empty()) {
            weeks.push_back(currentWeekSubjects);
            currentWeekSubjects.clear();
            currentCredits = 0;
        }
        
        currentWeekSubjects.push_back(subject);
        currentCredits += weight;
    }
    
    if (!currentWeekSubjects.empty()) {
        weeks.push_back(currentWeekSubjects);
    }
    
    return weeks;
}

bool checkPrerequisite(
    const Graph &graph,
    const string &subject,
    const vector<string> &completed
) {
    try {
        vector<string> prereqs = graph.getPrerequisites(subject);
        for (const string &pr : prereqs) {
            bool found = (find(completed.begin(), completed.end(), pr) != completed.end());
            if (!found) {
                return false;
            }
        }
        return true;
    } catch (...) {
        return false;
    }
}
