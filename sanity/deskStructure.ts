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
        .title('Art')
        .child(
          S.list()
            .title('Art')
            .items([
              S.listItem()
                .title('Home Gallery')
                .child(
                  S.editor()
                    .schemaType('homeGallery')
                    .documentId('homeGalleryArt')
                )
                .icon(() => '🏠'),
              S.listItem()
                .title('Work Order')
                .child(
                  S.editor()
                    .schemaType('workOrder')
                    .documentId('workOrderArt')
                )
                .icon(() => '📋'),
              S.divider(),
              S.listItem()
                .title('All Work')
                .child(
                  S.documentList()
                    .title('Work (Art)')
                    .filter('_type == "work" && discipline == "art"')
                    .defaultOrdering([{ field: 'year', direction: 'desc' }])
                ),
              orderableDocumentListDeskItem({
                type: 'indexItem',
                title: 'Index',
                id: 'orderable-index-art',
                filter: `discipline == "art"`,
                S,
                context,
              }),
            ])
        ),
      S.listItem()
        .title('Design')
        .child(
          S.list()
            .title('Design')
            .items([
              S.listItem()
                .title('Home Gallery')
                .child(
                  S.editor()
                    .schemaType('homeGallery')
                    .documentId('homeGalleryDesign')
                )
                .icon(() => '🏠'),
              S.listItem()
                .title('Work Order')
                .child(
                  S.editor()
                    .schemaType('workOrder')
                    .documentId('workOrderDesign')
                )
                .icon(() => '📋'),
              S.divider(),
              S.listItem()
                .title('All Work')
                .child(
                  S.documentList()
                    .title('Work (Design)')
                    .filter('_type == "work" && discipline == "design"')
                    .defaultOrdering([{ field: 'year', direction: 'desc' }])
                ),
              orderableDocumentListDeskItem({
                type: 'indexItem',
                title: 'Index',
                id: 'orderable-index-design',
                filter: `discipline == "design"`,
                S,
                context,
              }),
            ])
        ),
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
