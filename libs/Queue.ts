import { Linklist } from "./Linklist";

export class Queue<T> {
    #linklist: Linklist<T>;
    
    constructor() {
        this.#linklist = new Linklist<T>();
    }

    enqueue(data: T) {
        this.#linklist.push(data);
    }

    dequeue(): T {
        return this.#linklist.pop_head();
    }
    
    peek(): T {
        return this.#linklist.pop_by_index(0);
    }

    length(): number {
        return this.#linklist.length();
    }

    is_empty(): boolean {
        return (this.length() === 0);
    }

    serialize() {
        return this.#linklist.serialize();   
    }

    deserialize(serializedObj: string) {
        this.#linklist.deserialize(serializedObj);
    }
}