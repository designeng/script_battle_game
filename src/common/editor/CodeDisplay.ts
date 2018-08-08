import * as jsdiff from "diff";

export class CodeDisplay {

    private previous = '';
    private current = '';
    private pre: HTMLPreElement;

    constructor(private container: HTMLElement) {
        this.pre = document.createElement('pre');

        this.container.appendChild(this.pre);
    }

    setCode(code: string) {
        this.previous = this.current;
        this.current = code;

        const diff = jsdiff.diffChars(this.previous, this.current);
        const fragment = document.createDocumentFragment();

        let span = null;
        let color = '';

        diff.forEach(function(part){
            // green for additions, red for deletions
            // grey for common parts
            if (part.removed) {
                return;
            }

            color = part.added ? 'green' : 'grey';
            span = document.createElement('span');
            span.style.color = color;
            span.appendChild(document
                .createTextNode(part.value));
            fragment.appendChild(span);
        });

        this.pre.innerText = '';

        this.pre.appendChild(fragment);
    }

}