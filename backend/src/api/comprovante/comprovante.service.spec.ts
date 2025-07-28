import { Test, TestingModule } from '@nestjs/testing';
import { ComprovanteService } from './comprovante.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Payload } from 'src/auth/entities/payload.entity';
import { ComprovanteEntity } from './entities/comprovante.entity';

describe('ComprovanteService', () => {
  let service: ComprovanteService;

  // Mock do PrismaService
  const mockPrismaService = {
    proof: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComprovanteService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ComprovanteService>(ComprovanteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    const validId = '123e4567-e89b-12d3-a456-426614174000';
    const validUser: Payload = {
      id: '987fcdeb-51a2-43d1-9c4e-123456789abc',
      email: 'test@example.com',
      name: 'Test User',
      status: true,
    };

    const mockComprovante: ComprovanteEntity = {
      id: validId,
      userId: validUser.id!,
      fileName: 'comprovante.pdf',
      locale: '/path/to/file.pdf',
      mimeType: 'application/pdf',
    };

    it('deve retornar um comprovante quando encontrado', async () => {
      // Arrange
      mockPrismaService.proof.findUnique.mockResolvedValue(mockComprovante);

      // Act
      const result = await service.findOne(validId, validUser);

      // Assert
      expect(result).toEqual(mockComprovante);
      expect(mockPrismaService.proof.findUnique).toHaveBeenCalledWith({
        where: {
          id: validId,
          userId: validUser.id,
        },
      });
    });

    it('deve lançar erro quando o usuário for undefined', async () => {
      // Arrange & Act & Assert
      await expect(service.findOne(validId, undefined as any)).rejects.toThrow(
        'Usuário não autenticado ou dados de autenticação inválidos',
      );

      expect(mockPrismaService.proof.findUnique).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando o usuário não tiver ID', async () => {
      // Arrange
      const userWithoutId = { ...validUser, id: undefined as any };

      // Act & Assert
      await expect(service.findOne(validId, userWithoutId)).rejects.toThrow(
        'Usuário não autenticado ou dados de autenticação inválidos',
      );

      expect(mockPrismaService.proof.findUnique).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando o ID do comprovante for inválido', async () => {
      // Act & Assert
      await expect(service.findOne('', validUser)).rejects.toThrow(
        'ID do comprovante é obrigatório e deve ser uma string válida',
      );

      await expect(service.findOne(null as any, validUser)).rejects.toThrow(
        'ID do comprovante é obrigatório e deve ser uma string válida',
      );

      await expect(service.findOne(123 as any, validUser)).rejects.toThrow(
        'ID do comprovante é obrigatório e deve ser uma string válida',
      );

      expect(mockPrismaService.proof.findUnique).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando o comprovante não for encontrado', async () => {
      // Arrange
      mockPrismaService.proof.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(validId, validUser)).rejects.toThrow(
        `Comprovante com ID '${validId}' não encontrado ou você não tem permissão para acessá-lo`,
      );

      expect(mockPrismaService.proof.findUnique).toHaveBeenCalledWith({
        where: {
          id: validId,
          userId: validUser.id,
        },
      });
    });

    it('deve validar que o comprovante pertence ao usuário correto', async () => {
      // Arrange
      mockPrismaService.proof.findUnique.mockResolvedValue(mockComprovante);

      // Act
      await service.findOne(validId, validUser);

      // Assert
      expect(mockPrismaService.proof.findUnique).toHaveBeenCalledWith({
        where: {
          id: validId,
          userId: validUser.id, // Verifica se está filtrando pelo ID do usuário
        },
      });
    });
  });
});
