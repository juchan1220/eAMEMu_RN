package dev.nulldori.eamemu

import java.io.UnsupportedEncodingException
import kotlin.experimental.xor

class A {
    private var a: B? = null

    init {
        try {
            this.a = B("?I\'llB2c.YouXXXeMeHaYpy!".toByteArray(charset("US-ASCII")))
        } catch (v0: UnsupportedEncodingException) {
            throw RuntimeException(v0)
        }

    }
    private val validCharacters = "0123456789ABCDEFGHJKLMNPRSTUWXYZ"

    fun toKonamiID(arg11: String): String {
        if (arg11.length != 16) {
            throw RuntimeException("Invalid UID length")
        }
        return when {
            arg11.toUpperCase().startsWith("E004") -> toKonamiID(arg11, 1.toByte())
            arg11.toUpperCase().startsWith("0") -> toKonamiID(arg11, 2.toByte())
            else -> throw RuntimeException("Invalid UID prefix")
        }
    }

    fun toKonamiID(arg11: String, card_type: Byte): String {
        var v3: ByteArray
        val v9 = 13
        val v8 = 16
        val v7 = 8
        var v0 = 0
        try {
            v3 = E.a(arg11 as CharSequence)
        } catch (v0_1: Exception) {
            throw IllegalArgumentException(v0_1 as Throwable)
        }

        if (v3.size != v7) {
            throw IllegalArgumentException("KONAMI ID should be 8 bytes, not " + v3.size)
        }

        var v4 = ByteArray(v7)
        var v1: Int
        v1 = 0
        while (v1 < v7) {
            v4[7 - v1] = v3[v1]
            ++v1
        }

        v3 = this.a!!.a(v4)
        v4 = ByteArray(65)
        v1 = 0
        while (v1 < 64) {
            v4[v1] = (v3[v1 shr 3].toInt() shr (v1 xor -1 and 7) and 1).toByte()
            ++v1
        }

        v3 = ByteArray(v8)
        v1 = 0
        while (v1 < v9) {
            v3[v1] = (v4[v1 * 5].toInt() shl 4 and 255 or (v4[v1 * 5 + 1].toInt() shl 3 and 255) or (v4[v1 * 5 + 2].toInt() shl 2 and 255) or (v4[v1 * 5 + 3].toInt() shl 1 and 255) or (v4[v1 * 5 + 4].toInt() and 255)).toByte()
            ++v1
        }

        v3[v9] = 1
        v3[0] = (v3[0].toInt() xor card_type.toInt()).toByte()
        v1 = 1
        while (v1 < 14) {
            v3[v1] = v3[v1] xor v3[v1 - 1]
            ++v1
        }

        v3[14] = card_type
        v3[15] = calculate_checksum(v3).toByte()
        val v1_1 = CharArray(v8)
        while (v0 < v8) {
            v1_1[v0] = "0123456789ABCDEFGHJKLMNPRSTUWXYZ".get(v3[v0].toInt())
            ++v0
        }

        return String(v1_1)
    }

    fun toUID(str: String): String {
        return when(str[14]) {
            '1' -> toUID(str, 1.toByte())
            '2' -> toUID(str, 2.toByte())
            else -> throw RuntimeException("Invalid Konami ID")
        }
    }

    fun toUID(str: String, card_type: Byte): String {
        if (str.length != 16) {
            throw RuntimeException("KONAMI ID should be 16 characters, not ${str.length}")
        }
        val bArr = ByteArray(16)
        for (i in 0 until 16) {
            val index = validCharacters.indexOf(str[i])
            if (index >= 0) {
                bArr[i] = index.toByte()
            }
            else {
                throw RuntimeException("KONAMI ID entered is not Upper Alpha Numeric. See character $i")
            }
        }
        return toUID(bArr, card_type)
    }

    fun toUID(bArr: ByteArray) = toUID(bArr.copyOf(), bArr[14])

    private fun toUID(bArr: ByteArray, card_type: Byte): String {

        if (bArr[11] % 2 != bArr[12] % 2) {
            throw RuntimeException("Wrong parity")
        }
        if (bArr[13] != bArr[12] xor 1) {
            throw RuntimeException("14th character must be 13th character xor 1")
        }
        if (bArr[14] == card_type && bArr[15].toInt() == calculate_checksum(bArr)) {
            var i2 = 13
            while (i2 > 0) {
                bArr[i2] = (bArr[i2].toInt() xor bArr[i2 - 1].toInt()).toByte()
                i2--
            }
            bArr[0] = (bArr[0].toInt() xor card_type.toInt()).toByte()
            var bArr2 = ByteArray(64)
            i2 = 0
            while (i2 < 64) {
                bArr2[i2] = (bArr[i2 / 5].toInt() shr 4 - i2 % 5 and 1).toByte()
                i2++
            }
            var bArr3 = ByteArray(8)
            i2 = 0
            while (i2 < 64) {
                val i3 = i2 / 8
                bArr3[i3] = (bArr3[i3].toInt() or (bArr2[i2].toInt() shl (i2 xor -1 and 7)).toByte().toInt()).toByte()
                i2++
            }
            bArr2 = this.a!!.b(bArr3)
            bArr3 = ByteArray(8)
            i2 = 0
            while (i2 < 8) {
                bArr3[i2] = bArr2[7 - i2]
                i2++
            }
            val prefix = bArr3[0].toInt() and 0xFF shl 8 or (bArr3[1].toInt() and 0xFF)
            if (card_type.toInt() == 1 && prefix == 0xE004 || card_type.toInt() == 2 && (prefix and 0xF000 == 0)) {
                return E.a(bArr3)
            }
            //throw RuntimeException("Decoding failed: Prefix ${prefix.toString(16)} does not match card type.")
            return "" // Exceptions are slow, so return an empty string here instead
            //throw new RuntimeException("Sanity check error, KONAMI ID does not decode to ICODE with NXP chip");
        }
        throw RuntimeException("Invalid Checksum")
    }
    fun calculate_checksum(arg4: ByteArray): Int {
        var v0 = 0
        var v1 = 0
        while (v1 < 15) {
            val v2 = (v1 % 3 + 1) * arg4[v1] + v0
            ++v1
            v0 = v2
        }

        while (v0 >= 32) {
            v0 = v0.ushr(5) + (v0 and 31)
        }

        return v0
    }
}

