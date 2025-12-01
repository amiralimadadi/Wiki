import { toPersianDigits } from "../utils/persianNu";
export interface Articles {
  id: number;
  name?: string;
  date?: string;
  author?: string;
  chekide?: string;
  category?: string;
  content?: string;
  references?: string;
  knowledgeTree?: string;
}

export function generatePrintableHTML(article: Articles) {
  return `
    <div class="print-container">
      <div class="document-container">
        <div class="row title-row">
          <div class="logo-cell">
            <img src="/Picture1.jpg" height="150">
          </div>
          <div class="title-cell">فرم سند ساختاریافته</div>
          <div class="date-cell">
            <span>تاریخ ثبت :</span>
            <span>
            ${toPersianDigits(article.date || "۲۰۲۵/۰۶/۰۳")}
            </span>
          </div>
        </div>
        <div class="row">
          <div class="subject-cell">${article.name || "بدون عنوان"}</div>
          <div class="author-cell">${article.author || "نامشخص"}</div>
        </div>
        <div class="row">
          <div class="label-cell">چکیده</div>
          <div class="content-cell">${article.chekide || ""}</div>
        </div>
        <div class="row">
          <div class="label-cell">کلیدواژه</div>
          <div class="content-cell">${article.category || ""}</div>
        </div>
        <div class="row">
          <div class="label-cell">
            <div class="multi-line-label">
              <span>محتوای اصلی</span>
              <span>(متن)</span>
            </div>
          </div>
          <div class="content-cell">${article.content || ""}</div>
        </div>
        <div class="row">
          <div class="label-cell">منابع</div>
          <div class="content-cell">${article.references || ""}</div>
        </div>
        <div class="row">
          <div class="label-cell">درخت دانش</div>
          <div class="content-cell">${article.knowledgeTree || ""}</div>
        </div>
      </div>
    </div>
  `;
}
