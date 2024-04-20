// Retrieve tasks and nextId from localStorage
// let taskList = JSON.parse(localStorage.getItem("tasks"));
let taskboard = JSON.parse(localStorage.getItem("taskboard"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Element tags that are will be used
const addTaskInFormElement = $('#addTaskInForm');
const containerDivElement = $('.container');

// Object taskboard that contains 3 arrays with the todo, in progress, and done phase
// Each task should contain Id, task, due date, and description
if (!taskboard) {
  taskboard = {
    toDo: [],
    inProgress: [],
    done: []
  }
}


////
// Event Listeners
////

///
// Inner Modal Form Add Task button listener
///
addTaskInFormElement.on('click', (event) => {
  // Check the state where tastList is empty, if so then create the object with board and taskList
  const taskInputElement = $('#task');
  const taskDueDateElement = $('#taskDueDate');
  const taskDescriptionElement = $('#taskDescription');
  
  // Validate fields are filled out
  if (!taskInputElement.val() || !taskDueDateElement.val() || !taskDescriptionElement.val()) {
    alert('Please fill out all the fields'); 
  } else {
    generateTaskId();
    const task = {
      id: nextId,
      title: taskInputElement.val(),
      dueDate: taskDueDateElement.val(),
      description: taskDescriptionElement.val()
    }
    
    taskboard.toDo.push(task);
    localStorage.setItem('taskboard', JSON.stringify(taskboard));
    createTaskCard(task, 'toDo');
    
    // Clear out Modal fields
    taskInputElement.val('');
    taskDueDateElement.val('');
    taskDescriptionElement.val('');
    $('.modal').modal('toggle');
  }
})

///
// Container listener for delete task since the delete button will not exist until later
///
containerDivElement.on('click', handleDeleteTask);


////////////////
// Function declarations
////////////////


// Create a function to generate a unique task id
function generateTaskId() {
  nextId = JSON.parse(localStorage.getItem("nextId"));
  if (!nextId) { 
    nextId = 1;
  }
  localStorage.setItem("nextId", nextId + 1);
}

// Todo: create a function to create a task card
function createTaskCard(task, phase) {
  const toDoCardsElement = $('#todo-cards');
  const inProgressElement = $('#in-progress-cards');
  const doneElement = $('#done-cards');
  const column = {toDo: toDoCardsElement, inProgress: inProgressElement, done: doneElement};
  
  column[phase].append(`<div class="card my-3 z-3" >
  <div class="card body text-center" data-project-id="${task.id}">
  <h5 class="card-title">Task Name: ${task.title}</h5>
  <p class="card-text">Task Description: ${task.description}</p>
  <p class="card-text">Due Date: ${task.dueDate}</p>
  <div class="text-center btn-div">
  <button class="btn btn-danger delete" data-project-id="${task.id}">Delete</button>
  </div>
  </div>
  </div>`);
  
  let dataProjectIdDivElement = column[phase].children('.card').children(`[data-project-id="${task.id}"]`);
  const buttonForCardElement = column[phase].children().children().children('div').children(`[data-project-id="${task.id}"]`);
  const dueDate = dayjs(task.dueDate, 'DD/MM/YYYY');
  
  // Make cards draggable
  dataProjectIdDivElement.parent().draggable( {
    opacity: 0.65,
    zIndex: 100
  });
  
  // Change color of background dependent on date
  if (phase !== 'done') {
    if (dayjs().isSame(dueDate, 'day')) {
      dataProjectIdDivElement.addClass('bg-warning text-white');
    } else if (dayjs().isAfter(dayjs(dueDate))) { // check to see if it's overdue
      dataProjectIdDivElement.addClass('bg-danger text-white');
      buttonForCardElement.addClass('border-light');
    }
  }
}

// Create a function to render the task list and make cards draggable
function renderTaskList() {
  const toDoCardsElement = $('#todo-cards');
  const inProgressElement = $('#in-progress-cards');
  const doneElement = $('#done-cards');
  
  // Remove all the cards first
  toDoCardsElement.empty();
  inProgressElement.empty();
  doneElement.empty();
  
  // Rebuild the phase with cards using the taskboard object as a reference
  for ( const [phase, tasks] of Object.entries(taskboard)) {
    tasks.forEach( task => {
      createTaskCard(task, phase);
    })
  }
}

// Create a function to handle adding a new task
function handleAddTask(event){
  // did this with an arrow funciton
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
  if ($(event.target).hasClass('delete')) {
    // Find the value in which phase the task id exists and delete it from the taskboard object
    removeTaskAndDisplay($(event.target).data('project-id'));
  }
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  // did this with an arrow function
}

// Remove a task
function removeTaskAndDisplay(projectId) {
  Object.values(taskboard).forEach( phase => {
    phase.forEach( (task, index, array) => {
      if (task.id === projectId) {
        array.splice([index],1);
        localStorage.setItem('taskboard', JSON.stringify(taskboard));
      }
    })
  })
  
  renderTaskList();
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();
  
  $('.droppable').droppable({
    drop: (event) => {
      const phaseDestination = $(event.target).data('phase');
      const originalTarget = $(event.originalEvent.target);
      let movingTask = {};
      let projectId = 0;
      
      if (originalTarget.hasClass('body')) {
        projectId = (originalTarget.data('projectId'));
      } else if (originalTarget.hasClass('card') && !originalTarget.hasClass('body')) { // if it's the parent we need to go down one level to get the project Id
        projectId = (originalTarget.children('.body').data('projectId'));
      } else {
        projectId = (originalTarget.parents('.body')).data('projectId');
      }
      
      // Save task object to be move to new phase
      Object.values(taskboard).forEach( phase => {
        phase.forEach( (task, index, array) => {
          if (task.id === projectId) {
            movingTask = array[index];
            
            removeTaskAndDisplay(projectId);
          }
        })
      })
      
      // move task to new destination phase
      taskboard[phaseDestination].unshift(movingTask);
      localStorage.setItem('taskboard', JSON.stringify(taskboard));
      renderTaskList();
      
    }
    
  })
});