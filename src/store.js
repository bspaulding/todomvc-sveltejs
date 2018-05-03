import { Store } from "svelte/store.js";
import Immutable from "immutable";

const { List, Map, Record } = Immutable;
const Todo = Record({
	id: "",
	completed: false,
	description: "",
	editing: false
});

class TodoStore extends Store {
	addTodo(description) {
		const todo = Todo({
			id: String(new Date().getTime()),
			description
		});
		const { todoIds, todosById } = this.get();
		this.set({
			todoIds: todoIds.concat(todo.id),
			todosById: todosById.set(todo.id, todo)
		});
	}

	clearCompleted() {
		const left = this.get().remainingTodos;
		this.set({
			todoIds: left.map(t => t.id),
			todosById: left.reduce((byId, t) => byId.set(t.id, t), Map())
		});
	}

	toggleTodo(id) {
		const byId = this.get().todosById;
		const todo = byId.get(id);
		this.set({
			todosById: byId.set(id, todo.set("completed", !todo.completed))
		});
	}

	deleteTodo(id) {
		const { todosById, todoIds } = this.get();
		this.set({
			todoIds: todoIds.filter(tid => tid !== id),
			todosById: todosById.delete(id)
		});
	}

	toggleAll() {
		const allDone = this.get().allTodos.every(t => t.completed);
		this.set({
			todosById: this.get().todosById.map((v, k) =>
				v.set("completed", !allDone)
			)
		});
	}

	viewAll() {
		this.set({ visibility: "all" });
	}

	viewActive() {
		this.set({ visibility: "active" });
	}

	viewCompleted() {
		this.set({ visibility: "completed" });
	}

	toggleEditing(id) {
		const byId = this.get().todosById;
		const todo = byId.get(id);
		this.set({
			todosById: byId.set(id, todo.set("editing", !todo.editing))
		});
	}

	updateTodoDescription(id, description) {
		const byId = this.get().todosById;
		const todo = byId.get(id);
		this.set({
			todosById: byId.set(id, todo.set('description', description))
		});
	}
}

const store = new TodoStore({
	todosById: Map({
		"0": Todo({ id: "0", description: "Taste JavaScript", completed: true }),
		"1": Todo({ id: "1", description: "Buy a unicorn", completed: false })
	}),
	todoIds: List(["0", "1"]),
	visibility: "all"
});

store.compute("allTodos", ["todosById", "todoIds"], (byId, ids, visibility) =>
	ids.map(id => byId.get(id))
);

store.compute("remainingTodos", ["allTodos"], todos =>
	todos.filter(t => !t.completed)
);

store.compute("completedTodos", ["allTodos"], todos =>
	todos.filter(t => t.completed)
);

store.compute(
	"visibleTodos",
	["allTodos", "remainingTodos", "completedTodos", "visibility"],
	(all, active, completed, visibility) =>
		({ all, active, completed }[visibility].toArray())
);

store.compute("viewingAll", ["visibility"], v => v === "all");
store.compute("viewingActive", ["visibility"], v => v === "active");
store.compute("viewingCompleted", ["visibility"], v => v === "completed");

store.on("state", ({ changed, current, previous }) =>
	console.log({ changed, current, previous })
);

export default store;
