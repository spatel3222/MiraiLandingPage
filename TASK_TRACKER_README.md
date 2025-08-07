# Personal Task Tracker with Claude AI

A private, intelligent task management system that converts handwritten notes to digital tasks using Claude AI's vision capabilities.

## 🎯 Features

### ✅ Complete Kanban Board
- **Three Columns**: To Do, In Progress, Done
- **Drag & Drop**: Move tasks between columns with smooth animations
- **Task Counters**: Real-time count of tasks in each column
- **Mobile Responsive**: Works perfectly on all devices

### 🧠 Claude AI Integration
- **Handwriting Recognition**: Upload photos of handwritten notes
- **Intelligent Extraction**: Claude analyzes and extracts actionable tasks
- **Smart Categorization**: Auto-assigns Day Job, Side Gig, or Home categories
- **Priority Detection**: Identifies urgency from visual cues (underlines, emphasis)
- **Context Understanding**: Maintains task relationships and dependencies

### 📱 Task Management
- **Categories**: Day Job (💼), Side Gig (🚀), Home (🏠)
- **Priority Levels**: High, Medium, Low (color-coded)
- **Rich Descriptions**: Add detailed task descriptions
- **Creation Dates**: Track when tasks were created
- **Local Storage**: All data stored privately on your device

## 🚀 Setup Instructions

### 1. Environment Variables
You need to set up your Claude API key as an environment variable:

**For Vercel Deployment:**
```bash
# Add to Vercel project settings
CLAUDE_API_KEY=your_anthropic_api_key_here
```

**For Local Development:**
```bash
# Create .env.local file
echo "CLAUDE_API_KEY=your_anthropic_api_key_here" > .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Deploy to Vercel
```bash
# Deploy to production
vercel --prod

# Or for development
vercel dev
```

### 4. Set Vercel Environment Variable
```bash
# Add your Claude API key to Vercel
vercel env add CLAUDE_API_KEY
```

## 🔐 Privacy & Security

- **Completely Private**: No external databases, all tasks stored locally
- **Secure API**: Claude API calls processed server-side
- **No Tracking**: No analytics or user tracking
- **Direct Access**: Only accessible via direct URL, not linked from main portal

## 🛠 Technical Architecture

### Frontend
- **Pure HTML/CSS/JavaScript** - No framework dependencies
- **Tailwind CSS** - For responsive styling
- **Sortable.js** - Drag and drop functionality
- **Local Storage** - Client-side data persistence

### Backend
- **Vercel Serverless Functions** - API endpoint for Claude integration
- **Anthropic Claude API** - Vision and language processing
- **Node.js** - Server-side runtime

### AI Processing Pipeline
1. **Image Upload** → Base64 conversion
2. **Claude Vision API** → Handwriting analysis
3. **Intelligent Extraction** → Task identification
4. **Smart Categorization** → Auto-assign categories
5. **Priority Detection** → Identify urgency levels
6. **Task Creation** → Add to Kanban board

## 📊 Claude AI Capabilities

### Vision Processing
- **Handwriting Recognition**: Various handwriting styles
- **Context Analysis**: Understands note structure and meaning
- **Visual Cues**: Detects emphasis, underlining, urgency markers
- **Multi-format Support**: Images, sketches, printed text

### Task Intelligence
- **Category Classification**: Work vs personal vs projects
- **Priority Assessment**: Urgency detection from visual cues
- **Task Breakdown**: Converts complex notes into actionable items
- **Relationship Mapping**: Maintains task dependencies

### Quality Assurance
- **Confidence Scoring**: Each extraction includes confidence level
- **Error Handling**: Graceful fallbacks for unclear handwriting
- **Validation**: Sanitizes and validates all extracted data
- **Rate Limiting**: Handles API limitations gracefully

## 🎨 Design Philosophy

### User Experience
- **Mobile-First**: Optimized for phone usage
- **Minimalist Interface**: Focus on tasks, not clutter
- **Instant Feedback**: Real-time updates and animations
- **Intuitive Navigation**: Natural drag-and-drop interactions

### AI Integration
- **Transparent Processing**: Clear indication of Claude AI work
- **Smart Defaults**: Intelligent categorization and priority
- **User Control**: Easy editing of AI suggestions
- **Progressive Enhancement**: Works without AI, enhanced with it

## 🚦 Usage Instructions

### Adding Tasks Manually
1. Click "Add Task" button
2. Fill in title, description, category, priority
3. Task appears in "To Do" column
4. Drag to move between columns

### Using Claude AI
1. Click "Select Files" or drag images to upload area
2. Choose photos of handwritten notes
3. Claude analyzes and extracts tasks
4. Review and edit extracted tasks
5. Tasks automatically appear in appropriate categories

### Managing Tasks
- **Move Tasks**: Drag between To Do → In Progress → Done
- **Edit Tasks**: Click task to modify details
- **Delete Tasks**: Click trash icon to remove
- **Categories**: Color-coded borders for easy identification

## 🔧 Customization Options

### Categories
Modify in the task creation modal:
- Day Job: Work-related tasks
- Side Gig: Personal projects, freelance work
- Home: Personal life, household tasks

### Priorities
- High: Red badge, urgent tasks
- Medium: Yellow badge, regular tasks  
- Low: Gray badge, optional tasks

### Styling
All styling uses Tailwind CSS classes and can be customized in the HTML file.

## 🐛 Troubleshooting

### Claude API Issues
- **401 Error**: Check your API key is correctly set
- **429 Error**: Rate limit exceeded, wait and retry
- **No tasks found**: Try clearer handwriting or more specific notes

### Upload Issues
- **Supported formats**: JPG, PNG, GIF, WebP
- **File size**: Recommended under 5MB per image
- **Multiple files**: Can process multiple images at once

### Data Issues
- **Tasks disappearing**: Check browser's local storage isn't full
- **Drag not working**: Ensure JavaScript is enabled
- **Mobile issues**: Try refreshing the page

## 📱 Access Information

**URL**: `https://crtx.in/personal-task-tracker.html`

**Privacy**: This URL is not linked anywhere and only you know it exists. It's your private productivity tool.

**Data Storage**: All tasks are stored locally on your device using browser localStorage. Nothing is sent to external databases.

---

Built with ❤️ using Claude AI for intelligent task extraction.