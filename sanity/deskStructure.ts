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
      orderableDocumentListDeskItem({
        type: 'work',
        title: 'Work (Art)',
        id: 'orderable-work-art',
        filter: `discipline == "art"`,
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: 'work',
        title: 'Work (Design)',
        id: 'orderable-work-design',
        filter: `discipline == "design"`,
        S,
        context,
      }),
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
        .title('All Documents')
        .child(
          S.documentList()
            .title('All Documents')
            .filter('_type in ["work", "indexItem"]')
        ),
    ])