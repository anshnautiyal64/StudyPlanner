#include "Graph.h"
#include "KahnAlgo.h"
#include "utils.h"
#include <iostream>
using namespace std;
int main() {
    try {
        Graph graph = buildGraphFromUserInput();

        TopoResult result = runKahnTopologicalSort(graph);

        if (result.hasCycle) {
            cout << "Cycle detected! Invalid study plan." << endl;
            return 1;
        }
        cout << "Valid study order:" << endl;
        for (size_t i = 0; i < result.order.size(); ++i) {
            cout << i + 1 << ". " << result.order[i] << endl;
        }
        return 0;
    } catch (const exception &e) {
        cerr << "Error: " << e.what() << endl;
        return 2;
    }
}
