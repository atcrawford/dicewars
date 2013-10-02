function canAttack(cell1, cell2) {
    // purpose of this function is to determine if cell2 is next to cell1 and can attack
    // criteria:
    // A1 can attack A2, B1 but not otherwise.
    // in other words, must be +/- 1 on either index.
    letters = {'a':1,'b':2,'c':3,'d':4}
    col1 = letters[cell1.slice(0,1)]
    row1 = cell1.slice(1,2)
    col2 = letters[cell2.slice(0,1)]
    row2 = cell2.slice(1,2)
    if (col1 == col2) {
        if (Math.abs(row1 - row2) == 1) {
            return true
        }
    } else if (row1 == row2) {
        if (Math.abs(col1 - col2) == 1) {
            return true
        }
    }
    return false;
}


test( "canAttack", function() {
    equal(canAttack("a1","b2"), false);
    equal(canAttack("a1","a2"), true);
    equal(canAttack("a1","b1"), true);
});