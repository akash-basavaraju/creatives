const BackgoundColors = {
  colors: ["#fad089", "#0ca5b0", "#f0d8a8", "#230f2b", "#fcfef5"],
};

class DOMDataUpdater {
  constructor(domBuilder, tagId, onDataUpdated, initialData) {
    this._data = initialData;
    this._domBuilder = domBuilder;
    this._tagId = tagId;
    this._onDataUpdated = onDataUpdated;

    this.updateDom();
  }

  set data(data) {
    this._data = data;
    this.updateDom();
  }

  updateDom() {
    const htmlString = this._domBuilder(this._data);
    const element = document.getElementById(this._tagId);
    element.innerHTML = htmlString;
    this._onDataUpdated(this._data);
  }

  get data() {
    return this._data;
  }
}

var filterBy = new DOMDataUpdater(
  (updatedData) => {
    return `<div class="filter_container">
        <div>Filter By</div>
        <div>
          <div>
            <div>Colors : </div>
            <div>
              ${BackgoundColors.colors
                .map((color) => {
                  return `<div
                  style="margin: 10px; padding:5px; width: 8px; background:${color}; ${
                    updatedData.selectedColor === color
                      ? "border: 5px solid black;"
                      : ""
                  }"
                  data-color="${color}"
                  onclick="handleColorCheck(event)"
                ></div>`;
                })
                .join("")}
            </div>
          </div>
          <div>
            <div>title/subtitle :</div>
            <input type="text" onchange="handleSearchChange(event)" value="${
              updatedData.searchText
            }"></input>
          </div>
        </div>
      </div>`;
  },
  "filterBy",
  () => {},
  { selectedColor: null, searchText: "" }
);

var creativeBar = new DOMDataUpdater(
  (updatedData) => {
    return `<div class="creative_bar_container">
        <div
          class="creative_bar"
          style="width: ${updatedData.creativesAvailable * 50}px"
        >
          <div
            class="creative_bar_fill"
            style="width: ${updatedData.creativesCompleted * 50}px"
          ></div>
        </div>
        <div>
          ${updatedData.creativesCompleted} / ${updatedData.creativesAvailable}
        </div>
      </div>`;
  },
  "creativeBar",
  () => {},
  { creativesAvailable: 5, creativesCompleted: 0 }
);

var addCreativeModal = new DOMDataUpdater(
  (updatedData) => {
    if (!updatedData.show) {
      return "";
    }
    return `<div class="modal_container">
          Title
          <input
            class="modal_title"
            onchange="handleModalTitle(event)"
            value="${updatedData.title}"
          ></input>
          Sub Title
          <input
            class="modal_subtitle"
            onchange="handleModalSubTitle(event)"
            value="${updatedData.subTitle}"
          ></input>
          <div>Select Color : </div>
          ${BackgoundColors.colors
            .map((color) => {
              return `<div
              style="margin: 10px; padding:5px; width: 8px; background:${color}; ${
                updatedData.color === color ? "border: 5px solid black;" : ""
              }"
              data-color="${color}"
              onclick="handleAddColorCheck(event)"
            ></div>`;
            })
            .join("")}
          <button class="modal_done" onclick="handleModalDone(event)">
            Done
          </button>
        </div>`;
  },
  "addCreativeModal",
  () => {},
  { show: false, title: "", subTitle: "", color: null }
);

function handleAddColorCheck(event) {
  addCreativeModal.data = {
    ...addCreativeModal.data,
    color: event.target.dataset.color,
  };
}

function handleModalTitle(event) {
  addCreativeModal.data = {
    ...addCreativeModal.data,
    title: event.target.value,
  };
}

function handleModalSubTitle(event) {
  addCreativeModal.data = {
    ...addCreativeModal.data,
    subTitle: event.target.value,
  };
}

var addCreative = new DOMDataUpdater(
  (updatedData) => {
    return `<button
        class="add_creative_button ${
          !updatedData.enableAddCreative ? "add_creative_blur" : ""
        }"
        onclick="handleAddCreative(event)"
      >
        Add Creative
      </button>`;
  },
  "addCreativeButton",
  (updatedData) => {
    addCreativeModal.data = {
      ...addCreativeModal.data,
      show: !updatedData.enableAddCreative,
    };
  },
  { enableAddCreative: true }
);

function handleAddCreative(event) {
  if (addCreative.data.enableAddCreative) {
    addCreative.data = { enableAddCreative: !addCreative.data };
  }
}

var creativeList = new DOMDataUpdater(
  (updatedData) => {
    const considerList = updatedData.isFilter
      ? updatedData.filtered
      : updatedData.full;
    return `<div>
        ${considerList
          .map(({ title, subTitle, color }) => {
            return `<div class="creative_box" style="background:${color};">
                <div>Title : ${title}</div>
                <div>SubTitle : ${subTitle}</div>
              </div>`;
          })
          .join("")}
      </div>`;
  },
  "creativeLists",
  () => {},
  { full: [], filtered: [] }
);

function handleModalDone(event) {
  creativeList.data = {
    ...creativeList.data,
    full: [
      ...creativeList.data.full,
      {
        title: addCreativeModal.data.title,
        subTitle: addCreativeModal.data.subTitle,
        color: addCreativeModal.data.color,
      },
    ],
  };
  addCreativeModal.data = { show: false, title: "", subTitle: "" };
  if (creativeList.data.full.length < 5) {
    addCreative.data = { enableAddCreative: true };
  }
  creativeBar.data = {
    ...creativeBar.data,
    creativesCompleted: creativeBar.data.creativesCompleted + 1,
  };
}

function performFilter() {
  const fitleredList = creativeList.data.full.filter(
    ({ title, subTitle, color }) => {
      return (
        (title.toUpperCase().includes(filterBy.data.searchText.toUpperCase()) ||
          subTitle
            .toUpperCase()
            .includes(filterBy.data.searchText.toUpperCase())) &&
        (filterBy.data.selectedColor
          ? color === filterBy.data.selectedColor
          : true)
      );
    }
  );

  creativeList.data = {
    ...creativeList.data,
    filtered: fitleredList,
    isFilter:
      filterBy.data.searchText.length > 0 && filterBy.data.selectedColor,
  };
}

function handleSearchChange(event) {
  filterBy.data = { ...filterBy.data, searchText: event.target.value };
  performFilter();
}

function handleColorCheck(event) {
  filterBy.data = {
    ...filterBy.data,
    selectedColor:
      filterBy.data.selectedColor === event.target.dataset.color
        ? null
        : event.target.dataset.color,
  };
  performFilter();
}
