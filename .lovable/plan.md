

## AI-Powered Kanban Board — Personal Life Goals Tracker

### Design Direction
Dark mode productivity tool inspired by the uploaded reference images (Codomo/Beyond UI). Clean card layouts with generous spacing, subtle borders, and a professional dark palette (dark grays/near-blacks with soft white text and accent colors for priorities).

### Page Layout
- **Top bar**: App name + dark/light mode toggle
- **Dashboard header**: Total estimated hours, hours completed, hours remaining, overall progress bar — all in a compact stats strip
- **Kanban board**: 3 columns (To Do, In Progress, Complete) with horizontal scroll if needed
- **Floating AI chat button**: Bottom-right corner, opens a slide-in chat panel

### Task Cards (matching reference style)
Each card displays:
- **Title** (bold, prominent)
- **Description snippet** (truncated, expandable)
- **Priority indicator** (color-coded dot/badge: Low=green, Medium=yellow, High=orange, Critical=red)
- **Due date** with calendar icon
- **Estimated hours** displayed prominently
- **Labels/tags** as small colored chips
- **Subtask progress** (e.g., "2/5 done" mini progress bar)
- **File attachment icon** (placeholder indicator)
- Hover reveals quick actions: Edit, Delete, Move to column
- Click to expand full detail modal with all fields editable

### Drag & Drop
- Cards draggable between columns using @dnd-kit
- Smooth animations on drop
- Column headers show task count badges

### Time Intelligence Panel (Dashboard Header)
- Total estimated hours across all tasks
- Hours in "Complete" column
- Hours remaining (To Do + In Progress)
- Visual progress bar (overall)
- Per-column mini progress indicators
- Deadline warning badges on overdue/near-due tasks

### AI Chatbot (Lovable AI powered)
- Floating button bottom-right, opens a chat drawer
- Professional & concise personality
- Supports natural language commands:
  - **Move tasks**: "Move [task] to In Progress"
  - **Create tasks**: "Add task: [name] with 3 hours"
  - **Mark complete**: "Mark [task] as done"
  - **Daily summary**: "What did I finish today?"
  - **Suggest next**: "What should I work on next?" (uses priority + due date)
- Toast notifications for every action taken
- Confirmation prompt before destructive actions (delete)
- Command history in chat

### UX Features
- **Keyboard shortcut**: Press "N" to open new task dialog
- **Empty state**: Illustrated placeholder for empty columns
- **Dark/Light mode toggle**
- **Responsive**: Desktop + tablet friendly
- **Smooth micro-animations**: Card transitions, fade-ins, hover effects
- **Toast notifications** via Sonner for all actions

### Technical Approach
- React + TypeScript + Tailwind (dark theme via CSS variables)
- @dnd-kit for drag-and-drop
- Local state management (React state + context) — no database needed initially
- Lovable Cloud edge function for AI chatbot (Lovable AI gateway)
- shadcn/ui components throughout

