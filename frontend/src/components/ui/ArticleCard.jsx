import React from 'react';

const ArticleCard = ({ imageSrc, gradientClass, eyebrow, title, meta }) => {
  return (
    <article className="group bg-white border border-slate-200 rounded-lg overflow-hidden hover:bg-slate-50 transition-colors">
      <div className="aspect-video w-full bg-slate-100">
        {imageSrc ? (
          <img src={imageSrc} alt={title || "Article image"} className="h-full w-full object-cover" width="400" height="225" loading="lazy" />
        ) : (
          <div className={`h-full w-full ${gradientClass || ''}`} />
        )}
      </div>
      <div className="p-4">
        {eyebrow ? (
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{eyebrow}</div>
        ) : null}
        <h3 className="text-slate-900 font-medium leading-snug line-clamp-2 group-hover:underline">
          {title}
        </h3>
        {meta ? (
          <div className="mt-2 text-sm text-slate-500">{meta}</div>
        ) : null}
      </div>
    </article>
  );
};

export default ArticleCard;


