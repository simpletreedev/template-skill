# Relations:
- list (1) - stage (n)
- stage (1) - item (n)
- list (1) - field (n)

# Create list:
- url: https://privos-chat-dev.roxane.one/api/v1/internal/lists.create
- method: POST
- payload: 
{
    fieldDefinitions: [] Mảng các field default dựa theo template
    roomId (string): Được truyền lên kèm theo user_question hỏi (vì user hỏi trong room)
}

# Create stage:
- url: https://privos-chat-dev.roxane.one/api/v1/internal/stages.create
- method: POST
- payload:
{
    listId (string)
    name (string) : unnamed (default)
}

# Create list field
- url: https://privos-chat-dev.roxane.one/api/v1/internal/lists.fields.create
- method: POST
- payload:
{
    listId: "698ad55670c8141271bf2c6b"
    name: "Number"
    order: 1
    type: "NUMBER"
}

# Create item:
- url: https://privos-chat-dev.roxane.one/api/v1/internal/items.create
- method: POST
- payload:
{
    customFields: [
        {fieldId: "bom3yMBMuBgSAC95o", value: "dfasdfdfsdf"}
    ]
    description (string): ""
    listId: "698ad55670c8141271bf2c6b"
    name: null
    stageId: "698ad55770c8141271bf2c6c"
}
