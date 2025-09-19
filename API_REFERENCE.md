# API Reference

## TaskAPI Class

### create_task(request_data: Dict[str, Any]) -> Dict[str, Any]

Creates a new task.

**Parameters:**
- `request_data`: Dictionary containing task data
  - `title` (required): Task title string
  - `description` (optional): Task description string
  - `priority` (optional): Priority level ("low", "medium", "high", "urgent")
  - `assignee` (optional): Username to assign task to

**Returns:**