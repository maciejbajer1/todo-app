from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import SQLModel, Session, select
from app import model
from app.database import engine, get_db

SQLModel.metadata.create_all(engine)

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request, session: Session = Depends(get_db)):
    tasks = session.exec(select(model.Task)).all()
    return templates.TemplateResponse("index.html", {"request": request, "tasks": tasks})

@app.post("/tasks/", response_model=model.Task)
def create_task(task: model.Task, session: Session = Depends(get_db)):
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.get("/tasks/", response_model=list[model.Task])
def read_tasks(skip: int = 0, limit: int = 100, session: Session = Depends(get_db)):
    tasks = session.exec(select(model.Task).offset(skip).limit(limit)).all()
    return tasks

@app.get("/task/{task_id}", response_model=model.Task)
def read_task(task_id: int, session: Session = Depends(get_db)):
    task = session.get(model.Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="task not found")
    return task

@app.put("/tasks/{task_id}", response_model=model.Task)
def update_task(task_id: int, task: model.Task, session: Session = Depends(get_db)):
    db_task = session.get(model.Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    task_data = task.model_dump(exclude_unset=True)
    for key, value in task_data.items():
        setattr(db_task, key, value)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_db)):
    task = session.get(model.Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
    return {"message": "Task deleted successfully"}


