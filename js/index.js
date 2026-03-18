/* 전체 문서 로드 후 실행 보장 */
document.addEventListener("DOMContentLoaded", () => {
  /* 주요 DOM 요소 캐싱 */
  const tilForm = document.querySelector("#til-form");
  const tilList = document.querySelector("#til-list");
  const nav = document.querySelector(".top-nav");

  /* 초기 데이터 로드 실행 */
  loadTILs();

  /* 스크롤 성능 최적화를 위한 틱 변수 */
  let isScrolling = false;

  /* 윈도우 스크롤 이벤트 리스너: 상단바 스타일 동적 변경 */
  window.addEventListener("scroll", () => {
    /* 이미 애니메이션 프레임이 대기 중이면 무시 */
    if (!isScrolling) {
      /* 브라우저 화면 갱신 주기에 맞춰 실행 (진동 방지) */
      window.requestAnimationFrame(() => {
        /* 상단바가 존재하는 경우에만 실행 */
        if (nav) {
          /* 50px 이상 내려오면 그림자 및 반투명 효과 적용 */
          if (window.scrollY > 50) {
            nav.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
            nav.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
          } else {
            /* 최상단에서는 스타일 초기화 */
            nav.style.boxShadow = "none";
            nav.style.backgroundColor = "var(--nav-bg-color)";
          }
        }
        /* 실행 완료 후 플래그 해제 */
        isScrolling = false;
      });
      /* 애니메이션 실행 예약 알림 */
      isScrolling = true;
    }
  });

  /* TIL 등록 폼 제출 이벤트 핸들러 */
  tilForm.addEventListener("submit", (event) => {
    /* 기본 제출 동작(새로고침) 차단 */
    event.preventDefault();

    /* 폼 데이터 추출 및 객체화 */
    const date = document.querySelector("#til-date").value;
    const title = document.querySelector("#til-title").value;
    const content = document.querySelector("#til-content").value;

    /* 고유 식별자를 포함한 TIL 데이터 생성 */
    const newTIL = {
      id: Date.now(),
      date,
      title,
      content,
    };

    /* 화면 업데이트 및 데이터 영구 저장 */
    addTILToDOM(newTIL);
    saveTIL(newTIL);

    /* 다음 입력을 위해 폼 초기화 */
    tilForm.reset();
  });

  /* TIL 데이터를 받아서 실제 HTML 요소로 생성 및 렌더링 */
  function addTILToDOM(til) {
    const article = document.createElement("article");
    article.className = "til-item";
    /* 데이터 추적을 위한 ID 속성 부여 */
    article.setAttribute("data-id", til.id);

    /* 줄바꿈을 <br> 태그로 변환하여 텍스트 렌더링 */
    article.innerHTML = `
      <time>${til.date}</time>
      <h3>${til.title}</h3>
      <p>${til.content.replace(/\n/g, "<br>")}</p>
      <button class="delete-btn" style="margin-top:15px; cursor:pointer; border:none; background:none; color:#ff4d4d; font-size:0.85rem; font-weight:bold;">[삭제]</button>
    `;

    /* 해당 아이템의 삭제 버튼 이벤트 바인딩 */
    article.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm("이 기록을 삭제하시겠습니까?")) {
        deleteTIL(til.id);
        article.remove();
      }
    });

    /* 새 콘텐츠를 목록의 가장 위에 추가 */
    tilList.prepend(article);
  }

  /* 로컬 스토리지에 새 TIL 데이터 추가 저장 */
  function saveTIL(til) {
    const tils = JSON.parse(localStorage.getItem("tils") || "[]");
    tils.push(til);
    localStorage.setItem("tils", JSON.stringify(tils));
  }

  /* 로컬 스토리지에서 전체 TIL 데이터를 불러와 화면에 표시 */
  function loadTILs() {
    const tils = JSON.parse(localStorage.getItem("tils") || "[]");
    /* 저장된 모든 항목을 DOM에 추가 */
    tils.forEach((til) => addTILToDOM(til));
  }

  /* 로컬 스토리지에서 특정 ID를 가진 TIL 데이터만 필터링하여 삭제 */
  function deleteTIL(id) {
    let tils = JSON.parse(localStorage.getItem("tils") || "[]");
    tils = tils.filter((til) => til.id !== id);
    localStorage.setItem("tils", JSON.stringify(tils));
  }

  const modal = document.querySelector("#image-modal");
  const fullImg = document.querySelector("#full-image");
  const galleryImages = Array.from(
    document.querySelectorAll(".gallery-grid img"),
  );
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  let currentIndex = 0;

  /* 특정 인덱스의 이미지를 모달에 표시하는 함수 */
  const updateModalImage = (index) => {
    currentIndex = index;
    fullImg.src = galleryImages[currentIndex].src;
  };

  /* 다음 이미지로 이동 (마지막이면 첫 번째로) */
  const showNext = (e) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % galleryImages.length;
    updateModalImage(nextIndex);
  };

  /* 이전 이미지로 이동 (첫 번째면 마지막으로) */
  const showPrev = (e) => {
    e.stopPropagation();
    const prevIndex =
      (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    updateModalImage(prevIndex);
  };

  /* 모달 닫기 함수 */
  const closeModal = () => {
    modal.style.display = "none";
    document.body.classList.remove("modal-open");
  };

  /* 갤러리 이미지 클릭 이벤트 */
  galleryImages.forEach((img, index) => {
    img.addEventListener("click", () => {
      currentIndex = index;
      updateModalImage(currentIndex);
      modal.style.display = "block";
      document.body.classList.add("modal-open");
    });
  });

  /* 버튼 클릭 이벤트 연결 */
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  /* 모달 배경 클릭 시 닫기 */
  modal.addEventListener("click", closeModal);

  /* --- 키보드 이벤트 추가 (ESC, 화살표) --- */
  window.addEventListener("keydown", (e) => {
    if (modal.style.display === "block") {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") showNext(e);
      if (e.key === "ArrowLeft") showPrev(e);
    }
  });
});
