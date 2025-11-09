import React, { useState } from 'react';

const POEM_TEMPLATES = {
  ballad: {
    '첫사랑': {
      title: '첫사랑의 설렘',
      template: `그대를 처음 만난 그 순간
마음이 두근거렸죠
시간이 멈춘 듯한 느낌
이것이 사랑인가요

따뜻한 그대 미소에
세상이 밝아지고
작은 손짓 하나에도
가슴이 뛰어요

이 마음 변하지 않을게요
영원히 간직할게요`,
      keywords: ['설렘', '두근거림', '미소', '영원']
    },
    '이별': {
      title: '아픈 이별',
      template: `우리가 함께 걸었던 길
이제는 혼자 걸어가야 해
그대 없는 세상이
이렇게 차가울 줄 몰랐어

눈물이 흘러내려도
아픈 마음 달랠 수 없어
그래도 고마웠어요
함께했던 모든 순간들

잘 지내요, 내 사랑
어디서든 행복하길`,
      keywords: ['이별', '눈물', '아픔', '추억']
    },
    '우정': {
      title: '소중한 친구',
      template: `힘들 때 곁에 있어준
진짜 친구가 있어
말하지 않아도 알아주는
따뜻한 마음

웃을 때도 울 때도
함께해준 고마운 사람
이 우정 오래오래
간직하고 싶어

고마워 내 친구야
너가 있어 든든해`,
      keywords: ['우정', '친구', '곁', '고마움']
    }
  },
  enka: {
    '인생': {
      title: '인생길',
      template: `긴 인생길을 걸어오며
수많은 일들을 겪었네
기쁨도 있었고 슬픔도 있었지만
모든 것이 소중한 경험

어머니의 사랑 속에서 자라
세상의 모든 것을 배웠고
지금은 나이 들어 되돌아보니
감사한 마음뿐이네

앞으로 남은 길에서도
최선을 다해 살아가리
인생이란 여행에서
만난 모든 인연들에게 고마워`,
      keywords: ['인생', '경험', '어머니', '감사']
    },
    '고향': {
      title: '그리운 고향',
      template: `멀리 떠나온 타향살이
고향 생각에 잠 못 드네
어린 시절 뛰놀던 그 동네
지금도 눈에 선해

아버지 어머니 계신 곳
따뜻한 사랑이 있는 곳
언젠가 돌아가고 싶은
마음의 고향

그리워라 고향이여
내 마음의 안식처`,
      keywords: ['고향', '그리움', '부모님', '안식처']
    },
    '세월': {
      title: '흘러간 세월',
      template: `세월이 강물처럼 흘러가고
젊은 날의 꿈들도 멀어져 가네
그때는 몰랐던 소중한 것들
지금에서야 깨달아

한이 서린 마음으로
오늘도 하루를 보내고
내일은 또 어떤 일들이
기다리고 있을까

세월아 너무 빨리 가지 마라
아직 할 일이 많이 남았는데`,
      keywords: ['세월', '꿈', '한', '내일']
    }
  }
};

export default function PoemTemplateSelector({ onSelectTemplate, style = 'ballad' }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = POEM_TEMPLATES[style] || POEM_TEMPLATES.ballad;

  const handleTemplateSelect = (template) => {
    onSelectTemplate(template.template);
    setShowTemplates(false);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShowTemplates(true);
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 p-6 shadow-premium animate-scale-in">
      <h3 className="font-display font-bold text-lg text-primary-700 mb-4 flex items-center gap-2">
        <i className="fas fa-scroll text-primary-500"></i>
        시 템플릿 제안
      </h3>
      
      <p className="text-sm text-neutral-600 mb-6">
        아래 템플릿을 참고하여 나만의 시를 작성해보세요. 템플릿을 선택하면 편집기에 자동으로 입력됩니다.
      </p>

      {!showTemplates ? (
        /* 카테고리 선택 */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(templates).map(([category, template]) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className="p-4 rounded-2xl border-2 border-primary-200/50 bg-white/60 hover:border-primary-300 hover:bg-white/80 transition-all duration-300 hover:scale-105 text-left group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                  style === 'ballad' ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gradient-to-r from-secondary-500 to-secondary-600'
                }`}>
                  <i className={`fas ${
                    category === '첫사랑' ? 'fa-heart' :
                    category === '이별' ? 'fa-heart-broken' :
                    category === '우정' ? 'fa-user-friends' :
                    category === '인생' ? 'fa-road' :
                    category === '고향' ? 'fa-home' :
                    category === '세월' ? 'fa-hourglass-half' : 'fa-feather-alt'
                  }`}></i>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 group-hover:text-primary-600">
                    {category}
                  </h4>
                  <p className="text-sm text-neutral-500">
                    {template.title}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-3">
                {template.keywords.slice(0, 3).map((keyword, idx) => (
                  <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* 선택된 템플릿 표시 */
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-primary-700">
              {templates[selectedCategory].title}
            </h4>
            <button
              onClick={() => {
                setShowTemplates(false);
                setSelectedCategory(null);
              }}
              className="p-2 rounded-lg hover:bg-primary-100 text-primary-600 transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-200/50 mb-6">
            <pre className="whitespace-pre-wrap text-neutral-700 leading-relaxed font-mono text-sm">
              {templates[selectedCategory].template}
            </pre>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-neutral-600 mr-2">키워드:</span>
            {templates[selectedCategory].keywords.map((keyword, idx) => (
              <span key={idx} className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm">
                {keyword}
              </span>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleTemplateSelect(templates[selectedCategory])}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i>
              템플릿 사용하기
            </button>
            <button
              onClick={() => {
                const customizedTemplate = templates[selectedCategory].template.replace(
                  /그대|너|당신/g, '___'
                ).replace(
                  /사랑|마음|감정/g, '___'
                );
                onSelectTemplate(customizedTemplate);
                setShowTemplates(false);
                setSelectedCategory(null);
              }}
              className="flex-1 px-4 py-3 bg-white border-2 border-primary-300 text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <i className="fas fa-edit"></i>
              수정해서 사용
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-white/30 text-center">
        <p className="text-xs text-neutral-500">
          💡 템플릿은 참고용입니다. 자유롭게 수정하여 나만의 시를 만들어보세요!
        </p>
      </div>
    </div>
  );
}