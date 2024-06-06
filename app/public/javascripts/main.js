/**
 * Created by andil on 28/02/2017.
 * Updated by Maxime Delacroix on 03/2021.
 */
let verbose = false;
// Ask for confirmation
$(document).on("click", ".actionConf", function (e) {
  let actionConf = confirm("Etes vous bien certain de vouloir MODIFIER ou SUPPRIMER des informations en base de données ?");
  if (!actionConf) {
    e.preventDefault();
  }
});

// Update table color
function updateTableColor(game) {
  if (verbose) console.log("===== updateTableColor() =====");
  try {
    let tbody = document.getElementById("tbody");
    // Create color scale  (using chroma library)
    let f = chroma.scale(["white", "red", "black"]);
    for (let i = 0, row; (row = tbody.rows[i]); i++) {
      for (let j = 0, col; (col = row.cells[j]); j++) {
        let color = f(Math.pow(game.data[i][j], 0.5)).hex();
        col.setAttribute("style", "background-color:" + color + ";");
      }
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * change the font color so that the value of the cell is always visible
 */
function changeFontColor() {
  if (verbose) console.log("===== changeFontColor() =====");
  let backgroundColor = $(".cell-active").css("background-color");
  let colorsOnly = backgroundColor
    .substring(
      // index of the first "(""
      backgroundColor.indexOf("(") + 1,
      // index of the closing "")""
      backgroundColor.lastIndexOf(")")
      // here we split that substring on occurrence
      // of a comma followed by zero or more white-
      // space characters:
    )
    .split(/,\s*/);
  // Get the value of the red channel
  let red = parseInt(colorsOnly[0]);

  if (red < 170) {
    $(".cell-value").css("color", "white");
  } else {
    $(".cell-value").css("color", "black");
  }
}

//Contruction of the table
function constructTable(game, event) {
  let matrixElmt = document.getElementById("matrix");
  let height = game.data.length;

  let hasTable = $("table").hasClass("table");
  if (!hasTable) {
    let table = document.createElement("table");
    table.setAttribute("class", "table");

    table.setAttribute("id", "removeTable");
    matrixElmt.appendChild(table);

    let tbody = document.createElement("tbody");
    tbody.setAttribute("id", "tbody");
    table.appendChild(tbody);
    for (let i = 0; i < height; i++) {
      let tr = document.createElement("tr");
      tbody.appendChild(tr);
      for (let j = 0; j < height; j++) {
        let td = document.createElement("td");
        tr.appendChild(td);
        td.setAttribute("style", "background-color:white;");
      }
    }
    if (event) {
      // EventListener avec selectRowCell => index|web en callback
      table.addEventListener("click", selectRowCell, false);
    }
  }
}

// convert date (millis) to date (dd-mm-yy-hh:mm)
function convertDate(millis) {
  let options = {
    hour: "numeric",
    minute: "numeric",
  };
  let d = new Intl.DateTimeFormat("fr", { day: "numeric" }).format(millis);
  let m = new Intl.DateTimeFormat("fr", { month: "numeric" }).format(millis);
  let y = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(millis);
  let hm = new Intl.DateTimeFormat("fr", options).format(millis);
  let date = `${d}-${m}-${y}-${hm}`;
  return date;
}

$(document).on("click", ".stigmer-btn-menu", function () {
  $(this).parents(".stigmer-page").toggleClass("stigmer-menu-open");
});

function isObjectInArray(array, x, y) {
  let bool = false;
  for (let element of array) {
    if (element.x == x && element.y == y) {
      bool = true;
      break;
    }
  }
  return bool;
}
