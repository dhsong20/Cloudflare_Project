class elementHandler {

    constructor(x) {
        this.x = x
    }

    element(element) {
      // An incoming element, such as `div`
      console.log(`Incoming element: ${element.tagName}`)
    }
  
    comments(comment) {
      // An incoming comment
    }
  
    text(text) {
      // An incoming piece of text
    }
  }
export default elementHandler