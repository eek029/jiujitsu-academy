module jiujitsu_academy::academy {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::option::{Self, Option};

    // ============= Errors =============
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_MENSALIDADE_VENCIDA: u64 = 2;
    const E_INVALID_FAIXA: u64 = 3;

    // ============= Structs =============
    
    /// Capacidade de administrador da academia
    public struct AdminCap has key, store {
        id: UID,
    }

    /// Perfil do aluno na blockchain
    public struct Aluno has key, store {
        id: UID,
        google_id: String,
        nome: String,
        faixa: String, // "branca", "azul", "roxa", "marrom", "preta"
        wallet_address: address,
        mensalidade_valida_ate: u64, // timestamp em ms
        total_presencas: u64,
        data_cadastro: u64,
        foto_perfil_blob_id: Option<String>, // CID do Walrus
    }

    /// Token de acesso mensal (NFT temporário)
    public struct AcessoMensal has key, store {
        id: UID,
        aluno_id: ID,
        valido_ate: u64,
        mes_referencia: String, // "2025-01"
    }

    /// Registro de presença
    public struct RegistroPresenca has key, store {
        id: UID,
        aluno_id: ID,
        timestamp: u64,
        foto_blob_id: String, // CID da foto no Walrus
    }

    /// Histórico de promoções
    public struct PromocaoFaixa has key, store {
        id: UID,
        aluno_id: ID,
        faixa_anterior: String,
        faixa_nova: String,
        timestamp: u64,
        foto_blob_id: String,
        professor: address,
    }

    // ============= Events =============
    
    public struct AlunoCreated has copy, drop {
        aluno_id: ID,
        nome: String,
        wallet_address: address,
        google_id: String,
    }

    public struct PresencaRegistrada has copy, drop {
        aluno_id: ID,
        timestamp: u64,
        foto_blob_id: String,
        total_presencas: u64,
    }

    public struct MensalidadePaga has copy, drop {
        aluno_id: ID,
        valor_brl: u64, // centavos
        valido_ate: u64,
        metodo: String, // "pix"
    }

    public struct FaixaPromovida has copy, drop {
        aluno_id: ID,
        faixa_anterior: String,
        faixa_nova: String,
        foto_blob_id: String,
        professor: address,
    }

    // ============= Init =============
    
    fun init(ctx: &mut TxContext) {
        // Cria capacidade de admin e transfere pro deployer
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));
    }

    // ============= Public Functions =============
    
    /// Cria novo aluno (chamado via sponsored transaction)
    public entry fun criar_aluno(
        google_id: vector<u8>,
        nome: vector<u8>,
        faixa: vector<u8>,
        wallet_address: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let aluno = Aluno {
            id: object::new(ctx),
            google_id: string::utf8(google_id),
            nome: string::utf8(nome),
            faixa: string::utf8(faixa),
            wallet_address,
            mensalidade_valida_ate: 0, // Precisa pagar primeira mensalidade
            total_presencas: 0,
            data_cadastro: clock::timestamp_ms(clock),
            foto_perfil_blob_id: option::none(),
        };

        let aluno_id = object::id(&aluno);

        event::emit(AlunoCreated {
            aluno_id,
            nome: aluno.nome,
            wallet_address,
            google_id: aluno.google_id,
        });

        // Transfere objeto pro endereço da carteira do aluno
        transfer::transfer(aluno, wallet_address);
    }

    /// Registra presença com foto no Walrus
    public entry fun registrar_presenca_com_foto(
        aluno: &mut Aluno,
        foto_blob_id: vector<u8>, // CID retornado pelo Walrus
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let timestamp = clock::timestamp_ms(clock);
        
        // Verifica se mensalidade está válida
        assert!(aluno.mensalidade_valida_ate >= timestamp, E_MENSALIDADE_VENCIDA);

        // Incrementa presença
        aluno.total_presencas = aluno.total_presencas + 1;

        let blob_id_str = string::utf8(foto_blob_id);
        let aluno_id = object::id(aluno);

        // Cria registro de presença
        let registro = RegistroPresenca {
            id: object::new(ctx),
            aluno_id,
            timestamp,
            foto_blob_id: blob_id_str,
        };

        event::emit(PresencaRegistrada {
            aluno_id,
            timestamp,
            foto_blob_id: blob_id_str,
            total_presencas: aluno.total_presencas,
        });

        // Transfere registro pro aluno (histórico)
        transfer::transfer(registro, aluno.wallet_address);
    }

    /// Atualiza mensalidade após pagamento validado
    public entry fun atualizar_mensalidade(
        _admin: &AdminCap, // Apenas admin pode chamar
        aluno: &mut Aluno,
        valor_brl_centavos: u64,
        dias_validade: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let timestamp = clock::timestamp_ms(clock);
        let nova_validade = timestamp + (dias_validade * 24 * 60 * 60 * 1000);
        
        aluno.mensalidade_valida_ate = nova_validade;

        // Cria token de acesso mensal
        let acesso = AcessoMensal {
            id: object::new(ctx),
            aluno_id: object::id(aluno),
            valido_ate: nova_validade,
            mes_referencia: string::utf8(b"2025-01"), // Backend calcula
        };

        event::emit(MensalidadePaga {
            aluno_id: object::id(aluno),
            valor_brl: valor_brl_centavos,
            valido_ate: nova_validade,
            metodo: string::utf8(b"pix"),
        });

        transfer::transfer(acesso, aluno.wallet_address);
    }

    /// Promove aluno para nova faixa
    public entry fun registrar_faixa_nova(
        _admin: &AdminCap,
        aluno: &mut Aluno,
        nova_faixa: vector<u8>,
        foto_blob_id: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let faixa_anterior = aluno.faixa;
        let nova_faixa_str = string::utf8(nova_faixa);
        let blob_id_str = string::utf8(foto_blob_id);
        
        aluno.faixa = nova_faixa_str;

        let promocao = PromocaoFaixa {
            id: object::new(ctx),
            aluno_id: object::id(aluno),
            faixa_anterior,
            faixa_nova: nova_faixa_str,
            timestamp: clock::timestamp_ms(clock),
            foto_blob_id: blob_id_str,
            professor: tx_context::sender(ctx),
        };

        event::emit(FaixaPromovida {
            aluno_id: object::id(aluno),
            faixa_anterior,
            faixa_nova: nova_faixa_str,
            foto_blob_id: blob_id_str,
            professor: tx_context::sender(ctx),
        });

        transfer::transfer(promocao, aluno.wallet_address);
    }

    /// Atualiza foto de perfil
    public entry fun atualizar_foto_perfil(
        aluno: &mut Aluno,
        foto_blob_id: vector<u8>,
        ctx: &TxContext
    ) {
        // Apenas o dono pode atualizar
        assert!(tx_context::sender(ctx) == aluno.wallet_address, E_NOT_AUTHORIZED);
        aluno.foto_perfil_blob_id = option::some(string::utf8(foto_blob_id));
    }

    // ============= View Functions =============
    
    public fun get_total_presencas(aluno: &Aluno): u64 {
        aluno.total_presencas
    }

    public fun get_mensalidade_valida(aluno: &Aluno): u64 {
        aluno.mensalidade_valida_ate
    }

    public fun get_faixa(aluno: &Aluno): String {
        aluno.faixa
    }

    public fun is_mensalidade_ativa(aluno: &Aluno, timestamp: u64): bool {
        aluno.mensalidade_valida_ate >= timestamp
    }
}
