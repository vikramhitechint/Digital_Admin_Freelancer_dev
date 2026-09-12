"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var f1, f2, f3, f4, hashedPassword, admin, mainClient, c1, c2, p1, p2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Start seeding...');
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'alex@htge.in' },
                            update: {},
                            create: {
                                email: 'alex@htge.in',
                                fullName: 'Alex Chen',
                                role: client_1.Role.FREELANCER,
                                profile: {
                                    create: {
                                        skills: ['React', 'Node.js', 'AWS'],
                                    }
                                }
                            },
                        })];
                case 1:
                    f1 = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'maya@htge.in' },
                            update: {},
                            create: {
                                email: 'maya@htge.in',
                                fullName: 'Maya Lin',
                                role: client_1.Role.FREELANCER,
                                profile: {
                                    create: {
                                        skills: ['Figma', 'UI/UX', 'Framer'],
                                    }
                                }
                            },
                        })];
                case 2:
                    f2 = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'rajesh@htge.in' },
                            update: {},
                            create: {
                                email: 'rajesh@htge.in',
                                fullName: 'Rajesh Sharma',
                                role: client_1.Role.FREELANCER,
                                profile: {
                                    create: {
                                        skills: ['Kubernetes', 'Docker', 'GCP'],
                                    }
                                }
                            },
                        })];
                case 3:
                    f3 = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'sarah@htge.in' },
                            update: {},
                            create: {
                                email: 'sarah@htge.in',
                                fullName: 'Sarah Connor',
                                role: client_1.Role.FREELANCER,
                                profile: {
                                    create: {
                                        skills: ['Solidity', 'Cryptography', 'Python'],
                                    }
                                }
                            },
                        })];
                case 4:
                    f4 = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash('password123', 10)];
                case 5:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'adminhtge@gmail.org' },
                            update: { password: hashedPassword },
                            create: {
                                email: 'adminhtge@gmail.org',
                                password: hashedPassword,
                                fullName: 'Super Admin',
                                role: client_1.Role.ADMIN,
                            },
                        })];
                case 6:
                    admin = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@htge.in' },
                            update: { password: hashedPassword },
                            create: {
                                email: 'admin@htge.in',
                                password: hashedPassword,
                                fullName: 'HTGE Main Client',
                                role: client_1.Role.CLIENT,
                                profile: {
                                    create: {
                                        companyName: 'HTGE',
                                    }
                                }
                            },
                        })];
                case 7:
                    mainClient = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'client1@apex.io' },
                            update: {},
                            create: {
                                email: 'client1@apex.io',
                                fullName: 'Apex AI Rep',
                                role: client_1.Role.CLIENT,
                                profile: {
                                    create: {
                                        companyName: 'Apex AI Labs',
                                    }
                                }
                            },
                        })];
                case 8:
                    c1 = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'client2@quant.co' },
                            update: {},
                            create: {
                                email: 'client2@quant.co',
                                fullName: 'QuantMesh Rep',
                                role: client_1.Role.CLIENT,
                                profile: {
                                    create: {
                                        companyName: 'QuantMesh Tech',
                                    }
                                }
                            },
                        })];
                case 9:
                    c2 = _a.sent();
                    return [4 /*yield*/, prisma.project.create({
                            data: {
                                title: 'Zero-Knowledge Rollup Settlement Bridge',
                                description: 'We need a robust layer-2 settlement bridge built on Ethereum. The freelancer must have deep knowledge of Cairo, Solidity, and zero-knowledge proofs. We expect full test coverage and audited smart contracts.',
                                budget: 480000,
                                timeline: '4 Weeks',
                                status: client_1.ProjectStatus.PUBLISHED,
                                clientId: c1.id,
                            }
                        })];
                case 10:
                    p1 = _a.sent();
                    return [4 /*yield*/, prisma.project.create({
                            data: {
                                title: 'PCI-DSS V4 Token Vault & SDK',
                                description: 'Looking to build a completely isolated tokenization vault to store credit card data for our payment gateway. Requires strict compliance with PCI-DSS v4 guidelines and an easy-to-use Node.js SDK.',
                                budget: 620000,
                                timeline: '6 Weeks',
                                status: client_1.ProjectStatus.PUBLISHED,
                                clientId: c2.id,
                                freelancers: {
                                    create: [
                                        { freelancerId: f1.id }
                                    ]
                                }
                            }
                        })];
                case 11:
                    p2 = _a.sent();
                    console.log('Seeding finished.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })
    .catch(function (e) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.error(e);
                return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                process.exit(1);
                return [2 /*return*/];
        }
    });
}); });
