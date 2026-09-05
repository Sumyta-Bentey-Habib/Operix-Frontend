export const TASK_DETAILS_STRINGS = {
  breadcrumbs: {
    dashboard: "Dashboard",
    tasks: "Tasks",
  },
  navigation: {
    backToTasks: "Back to Tasks",
  },
  eyebrow: "Task Details",
  referenceCode: {
    label: "REF",
    copyAria: "Copy reference code",
    copyTitle: "Copy reference code",
    copied: "Copied!",
  },
  badges: {
    overdue: "Overdue",
    onTrack: "On Track",
  },
  actions: {
    assignTask: "Assign Task",
    startTask: "Start Task",
  },
  stepper: {
    title: "Workflow Progress",
    stages: {
      pending: "Created",
      assigned: "Assigned",
      inProgress: "In Progress",
      underReview: "Review",
      completed: "Completed",
      cancelled: "Cancelled",
    },
    subtitles: {
      pending: "Awaiting assignment",
      assigned: "Assigned to member",
      inProgress: "Work underway",
      underReview: "Submission review",
      completed: "Verified & closed",
      cancelled: "Task cancelled",
      revisionRequired: "Revision requested",
    },
  },
  sections: {
    overview: "Task Overview",
    description: "Description",
    remarks: "Instructions & Remarks",
    lifecycle: "Lifecycle & Timeline",
    ownership: "Ownership & Context",
    workspace: "Workspace",
  },
  tabs: {
    submissions: "Submissions",
    attachments: "Attachments",
    history: "Activity History",
  },
  metadata: {
    status: "Status",
    priority: "Priority",
    overdue: "Overdue",
    team: "Team Reference",
    category: "Category Reference",
    createdBy: "Created By",
    dueDate: "Due Date",
    startedAt: "Started",
    completedAt: "Completed",
    cancelledAt: "Cancelled",
    createdAt: "Created",
    updatedAt: "Updated",
    notApplicable: "—",
    none: "None",
    noDescription: "No description provided for this task.",
    noRemarks: "No special remarks or instructions provided.",
  },
  loading: "Loading Task...",
} as const;

export const TASK_TABLE_STRINGS = {
  columns: {
    reference: "Reference",
    title: "Title",
    priority: "Priority",
    status: "Status",
    team: "Team Reference",
    due: "Due",
    overdue: "Overdue",
    created: "Created",
    actions: "Actions",
  },
  labels: {
    teamPrefix: "Team:",
    duePrefix: "Due:",
    createdPrefix: "Created:",
  },
  badges: {
    overdue: "Overdue",
    notOverdue: "No",
  },
  actions: {
    view: "View",
    assign: "Assign",
    start: "Start",
  },
} as const;
