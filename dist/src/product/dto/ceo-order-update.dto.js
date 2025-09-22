"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CeoOrderUpdateDto = exports.PaymentMethodEnum = exports.OrderStatusEnum = exports.PaymentStatusEnum = void 0;
const class_validator_1 = require("class-validator");
var PaymentStatusEnum;
(function (PaymentStatusEnum) {
    PaymentStatusEnum["PENDING"] = "pending";
    PaymentStatusEnum["PARTIAL"] = "partial";
    PaymentStatusEnum["PAID"] = "paid";
    PaymentStatusEnum["OVERPAID"] = "overpaid";
    PaymentStatusEnum["CONFIRMED"] = "confirmed";
})(PaymentStatusEnum || (exports.PaymentStatusEnum = PaymentStatusEnum = {}));
var OrderStatusEnum;
(function (OrderStatusEnum) {
    OrderStatusEnum["PENDING_PAYMENT"] = "pending_payment";
    OrderStatusEnum["PARTIAL_PAYMENT"] = "partial_payment";
    OrderStatusEnum["PAID"] = "paid";
    OrderStatusEnum["PROCESSING"] = "processing";
    OrderStatusEnum["SHIPPED"] = "shipped";
    OrderStatusEnum["DELIVERED"] = "delivered";
    OrderStatusEnum["CANCELLED"] = "cancelled";
})(OrderStatusEnum || (exports.OrderStatusEnum = OrderStatusEnum = {}));
var PaymentMethodEnum;
(function (PaymentMethodEnum) {
    PaymentMethodEnum["CASH"] = "cash";
    PaymentMethodEnum["CARD"] = "card";
    PaymentMethodEnum["TRANSFER"] = "transfer";
    PaymentMethodEnum["POS"] = "pos";
})(PaymentMethodEnum || (exports.PaymentMethodEnum = PaymentMethodEnum = {}));
class CeoOrderUpdateDto {
}
exports.CeoOrderUpdateDto = CeoOrderUpdateDto;
__decorate([
    (0, class_validator_1.IsEnum)(PaymentStatusEnum),
    __metadata("design:type", String)
], CeoOrderUpdateDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(OrderStatusEnum),
    __metadata("design:type", String)
], CeoOrderUpdateDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethodEnum),
    __metadata("design:type", String)
], CeoOrderUpdateDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CeoOrderUpdateDto.prototype, "paidAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CeoOrderUpdateDto.prototype, "balanceAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CeoOrderUpdateDto.prototype, "updatedBy", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CeoOrderUpdateDto.prototype, "paymentAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CeoOrderUpdateDto.prototype, "paymentReference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CeoOrderUpdateDto.prototype, "notes", void 0);
//# sourceMappingURL=ceo-order-update.dto.js.map