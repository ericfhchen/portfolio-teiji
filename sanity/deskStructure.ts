export const deskStructure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Work (Art)')
        .child(
          S.documentList()
            .title('Work (Art)')
            .filter('_type == "work" && discipline == "art"')
            .defaultOrdering([{ field: 'year', direction: 'desc' }])
        ),
      S.listItem()
        .title('Work (Design)')
        .child(
          S.documentList()
            .title('Work (Design)')
            .filter('_type == "work" && discipline == "design"')
            .defaultOrdering([{ field: 'year', direction: 'desc' }])
        ),
      S.divider(),
      S.listItem()
        .title('Index (Art)')
        .child(
          S.documentList()
            .title('Index (Art)')
            .filter('_type == "indexItem" && discipline == "art"')
            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
        ),
      S.listItem()
        .title('Index (Design)')
        .child(
          S.documentList()
            .title('Index (Design)')
            .filter('_type == "indexItem" && discipline == "design"')
            .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
        ),
      S.divider(),
      S.listItem()
        .title('All Documents')
        .child(
          S.documentList()
            .title('All Documents')
            .filter('_type in ["work", "indexItem"]')
        ),
    ])