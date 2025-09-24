# Task: Only Pending Task Status Show in ActiveTab 1

## Completed Steps
- [x] Analyzed the code in `src/pages/ParentDashboard.jsx` to understand the tab structure and task filtering logic.
- [x] Identified that activeTab 1 corresponds to "All Tasks" and currently shows all tasks without status filtering.
- [x] Modified the `displayTasks` filter in `src/pages/ParentDashboard.jsx` to only include tasks with status 'pending', 'pending-approval', or 'pending_approval' when activeTab === 1.
- [x] Ensured the change is specific to activeTab 1 and does not affect other tabs.
- [x] Added logging for selected child's tasks to the console when a child is selected in the dropdown for debugging purposes.

## Followup Steps
- [ ] Test the application to verify that only pending tasks are displayed in activeTab 1 (All Tasks section).
- [ ] Check that other tabs (e.g., activeTab 0 for Children, activeTab 4 for Approvals) remain unaffected and display correctly.
- [ ] Ensure no errors occur when switching tabs or filtering tasks.
- [ ] Update the TODO.md file to mark testing as complete once verified.
