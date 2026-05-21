(async () => {
  const dataUrl = "data/site-data.json";

  async function loadJson(url) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) {
      return null;
    }
  }

  function loadJsonp(url) {
    return new Promise((resolve) => {
      const callbackName = `portfolioCms_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      let cmsUrl;
      try {
        cmsUrl = new URL(url);
      } catch (_) {
        resolve(null);
        return;
      }

      cmsUrl.searchParams.set("callback", callbackName);
      script.src = cmsUrl.toString();
      script.async = true;

      const cleanup = () => {
        delete window[callbackName];
        script.remove();
      };

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        resolve(null);
      };

      document.head.appendChild(script);
    });
  }

  function mergeSiteData(base, cms) {
    if (!cms) return base;
    return {
      ...base,
      ...cms,
      site: {
        ...(base.site || {}),
        ...(cms.site || {}),
      },
      links: {
        ...(base.links || {}),
        ...(cms.links || {}),
      },
      learningMediaFolders:
        Array.isArray(cms.learningMediaFolders) && cms.learningMediaFolders.length
          ? cms.learningMediaFolders
          : base.learningMediaFolders,
      latestUpdates:
        Array.isArray(cms.latestUpdates) && cms.latestUpdates.length ? cms.latestUpdates : base.latestUpdates,
    };
  }

  async function loadSiteData() {
    const localData = await loadJson(dataUrl);
    const cmsApiUrl = localData?.site?.cmsApiUrl;
    if (!cmsApiUrl) return localData;

    const cmsData = (await loadJson(cmsApiUrl)) || (await loadJsonp(cmsApiUrl));
    return mergeSiteData(localData, cmsData);
  }

  function updateLinks(links) {
    if (!links) return;
    Object.entries(links).forEach(([key, url]) => {
      document.querySelectorAll(`[data-link="${key}"]`).forEach((el) => {
        el.setAttribute("href", url);
      });
    });
  }

  function folderIcon() {
    const icon = document.createElement("span");
    icon.className = "folder-icon small";
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  function renderLearningFolders(folders) {
    if (!Array.isArray(folders) || folders.length === 0) return;

    document.querySelectorAll('[data-render="learning-media-folders"]').forEach((container) => {
      container.replaceChildren(
        ...folders.map((folder) => {
          const link = document.createElement("a");
          link.href = folder.url;
          link.target = "_blank";
          link.rel = "noreferrer";

          const title = document.createElement("strong");
          title.textContent = folder.title;

          link.append(folderIcon(), title);
          return link;
        })
      );
    });

    document.querySelectorAll('[data-render="learning-media-folders-mini"]').forEach((container) => {
      container.replaceChildren(
        ...folders.map((folder) => {
          const link = document.createElement("a");
          link.href = folder.url;
          link.target = "_blank";
          link.rel = "noreferrer";
          link.textContent = folder.title;
          return link;
        })
      );
    });
  }

  function renderUpdates(updates) {
    if (!Array.isArray(updates) || updates.length === 0) return;
    document.querySelectorAll('[data-render="latest-updates"]').forEach((container) => {
      container.replaceChildren(
        ...updates.map((item) => {
          const article = document.createElement("article");
          const date = document.createElement("span");
          const title = document.createElement("h3");
          const detail = document.createElement("p");

          date.textContent = item.date;
          title.textContent = item.title;
          detail.textContent = item.detail;

          article.append(date, title, detail);
          if (item.link) {
            const link = document.createElement("a");
            link.className = "text-link";
            link.href = item.link;
            link.target = "_blank";
            link.rel = "noreferrer";
            link.textContent = "เปิดดู";
            article.append(link);
          }
          return article;
        })
      );
    });
  }

  const siteData = await loadSiteData();
  if (!siteData) return;

  updateLinks(siteData.links);
  renderLearningFolders(siteData.learningMediaFolders);
  renderUpdates(siteData.latestUpdates);
})();
