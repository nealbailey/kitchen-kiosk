/**
* Typescript array and collection helper extensions
*/
export class arrayEx {
  /**
  *  Only pushes values into an array that do not currently exist.
  *  @param array the string array to push a value into.
  *  @param message the string value to push into the array.
  */
  public uniquePush(array: string[], message: string) {
    if (array.indexOf(message) === -1)
      array.push(message);
  }

  /**
   *  Removes a string from an array.
   *  @param array the string array to splice out of.
   *  @param message the string value to remove.
   */
  public removeElement(array: string[], message: string) {
    array.forEach((item, index) => {
      if (item === message)
        array.splice(index, 1);
    });
  }
}
