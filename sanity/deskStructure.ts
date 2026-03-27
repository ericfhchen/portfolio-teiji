import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

export const deskStructure = (S: any, context: any) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .child(
          S.editor()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        )
        .icon(() => '⚙️'),
      S.divider(),
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
      orderableDocumentListDeskItem({
        type: 'indexItem',
        title: 'Index (Art)',
        id: 'orderable-index-art',
        filter: `discipline == "art"`,
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: 'indexItem',
        title: 'Index (Design)',
        id: 'orderable-index-design',
        filter: `discipline == "design"`,
        S,
        context,
      }),
      S.divider(),
      S.listItem()
        .title('About')
        .child(
          S.list()
            .title('About')
            .items([
              S.listItem()
                .title('About (Art)')
                .child(
                  S.documentList()
                    .title('About Art')
                    .filter(`_type == "about" && discipline == "art"`)
                    .canHandleIntent((intentName: string, params: any) => {
                      return intentName === 'create' && params.type === 'about'
                    })
                ),
              S.listItem()
                .title('About (Design)')
                .child(
                  S.documentList()
                    .title('About Design')
                    .filter(`_type == "about" && discipline == "design"`)
                    .canHandleIntent((intentName: string, params: any) => {
                      return intentName === 'create' && params.type === 'about'
                    })
                ),
            ])
        )
        .icon(() => '👤'),
      S.divider(),
      S.listItem()
        .title('All Documents')
        .child(
          S.documentList()
            .title('All Documents')
            .filter('_type in ["work", "indexItem", "about"]')
        ),
    ])