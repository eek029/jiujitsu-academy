module jiujitsu_academy::academy {
    use sui::object::UID;
    use sui::tx_context::TxContext;
    use std::string::String;

    /// Estrutura do Aluno
    public struct Student has key, store {
        id: UID,
        name: String,
        belt: String,
        photo_blob_id: String,
        wallet_address: address,
        created_at: u64,
    }

    /// Estrutura de Presença
    public struct Attendance has key, store {
        id: UID,
        student_id: address,
        photo_blob_id: String,
        timestamp: u64,
    }

    /// Criar novo aluno
    public fun create_student(
        name: vector<u8>,
        belt: vector<u8>,
        photo_blob_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        use sui::object;
        use sui::tx_context;
        use sui::transfer;
        use std::string;

        let student = Student {
            id: object::new(ctx),
            name: string::utf8(name),
            belt: string::utf8(belt),
            photo_blob_id: string::utf8(photo_blob_id),
            wallet_address: tx_context::sender(ctx),
            created_at: tx_context::epoch(ctx),
        };
        
        transfer::transfer(student, tx_context::sender(ctx));
    }

    /// Registrar presença
    public fun register_attendance(
        student_id: address,
        photo_blob_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        use sui::object;
        use sui::tx_context;
        use sui::transfer;
        use std::string;

        let attendance = Attendance {
            id: object::new(ctx),
            student_id,
            photo_blob_id: string::utf8(photo_blob_id),
            timestamp: tx_context::epoch(ctx),
        };
        
        transfer::transfer(attendance, tx_context::sender(ctx));
    }
}
